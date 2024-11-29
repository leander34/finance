import { BadRequestError, dayjs, ResourceNotFoundError } from '@saas/core'
import dinero from 'dinero.js'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { CreditCardService } from '@/application/service/credit-card-service'
import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'

export async function payCreditCardInvoice(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .post(
      '/organizations/:slug/credit-cards/invoice/:id/payments',
      {
        schema: {
          tags: ['Credit Cards'],
          summary: 'Create a credit card',
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
            id: z.string().uuid(),
          }),
          body: z.object({
            financialAccountId: z
              .string({
                required_error: 'Por favor, escolha uma conta para o cartão.',
              })
              .uuid(),
            amount: z
              .number({
                invalid_type_error: 'Valor inválido.',
                required_error: 'Limite inválido.',
              })
              .nonnegative({ message: 'Limite não pode ser negativo.' }),
            realizationDate: z
              .string({
                required_error: 'O campo data de realização é obrigatório.',
              })
              .refine(
                (value) => {
                  const validFormat = 'YYYY-MM-DD'
                  const isDateValid = dayjs(value, validFormat, true).isValid()
                  return isDateValid
                },
                {
                  path: ['realizationDate'],
                  message: 'Formato da data inválido.',
                },
              )
              .refine(
                (value) => {
                  if (dayjs(value).isAfter(dayjs())) {
                    return false
                  }
                  return true
                },
                {
                  path: ['realizationDate'],
                  message:
                    'Data selecionada inválida. Selecione uma data igual ou inferior a data de hoje.',
                },
              ),
          }),
          response: {
            201: z.null(),
          },
        },
      },
      async (request, reply) => {
        const creditCardService = new CreditCardService()
        const userId = await request.getCurrentUserId()
        const { slug, id } = request.params
        const { organization } = await request.getUserMembership(slug)
        const { financialAccountId, amount, realizationDate } = request.body

        const financialAccount = await prisma.financialAccount.findUnique({
          where: {
            id: financialAccountId,
          },
        })

        if (!financialAccount) {
          throw new ResourceNotFoundError('pt-br.notFound.financial-account')
        }

        const invoice = await prisma.creditCardInvoice.findUnique({
          where: {
            id,
            creditCard: {
              organizationId: organization.id,
            },
          },
          include: {
            invoicePayments: true,
            transactions: true,
          },
        })

        if (!invoice) {
          throw new ResourceNotFoundError('pt-br.notFound.invoice')
        }

        const creditCard = await prisma.creditCard.findUnique({
          where: {
            id: invoice.creditCardId,
          },
          select: {
            id: true,
            name: true,
          },
        })

        if (!creditCard) {
          throw new ResourceNotFoundError('pt-br.notFound.credit-card')
        }

        const { totalTransactionsValue, totalPaymentsValue } =
          await creditCardService.getTotalAmountOfCreditCardTransactionsAndPayments(
            {
              creditCardIds: null,
              organizationId: organization.id,
              invoiceId: id,
              startDate: null,
              endDate: null,
              invoiceMonth: null,
              invoiceYear: null,
            },
          )

        const paymentAmount = dinero({
          amount: amount * 100,
          currency: 'BRL',
        })

        const currentInvoiceValue =
          totalTransactionsValue.subtract(totalPaymentsValue)

        if (paymentAmount.greaterThan(currentInvoiceValue)) {
          throw new BadRequestError(
            'pt-br.invoice.payment-amount-greater-than-invoice-amount',
          )
        }

        const invoicePaymentCategory = await prisma.category.findFirst({
          where: {
            organizationId: organization.id,
            mainCategory: true,
            name: 'Cartão de crédito',
          },
          select: {
            id: true,
          },
        })

        await prisma.transaction.create({
          data: {
            amount: paymentAmount.multiply(-1).getAmount(),
            description: `Pagamento fatura "${creditCard.name}"`,
            realizationDate,
            status: 'PAID',
            type: 'EXPENSE',
            creditCardInvoicePaymentId: invoice.id,
            // creditCardId: invoice.creditCardId,
            organizationId: organization.id,
            userId,
            categoryId: invoicePaymentCategory!.id,
            financialAccountId,
            skip: false,
          },
        })

        return reply.status(201).send()
      },
    )
}
