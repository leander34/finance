import dayjs from 'dayjs'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { CreditCardService } from '@/application/service/credit-card-service'
import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'

export async function getCreditCardsOverview(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .post(
      '/organizations/:slug/credit-cards/overview',
      {
        schema: {
          tags: ['Credit Cards'],
          summary: 'Get credit cards overview',
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
          }),
          body: z.object({
            month: z
              .number({ coerce: true })
              .refine(
                (value) =>
                  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].includes(value),
                { message: 'Mês inválido.' },
              )
              .default(dayjs().get('month') + 1),
            year: z
              .number({
                coerce: true,
                invalid_type_error: 'Ano inválido.',
              })
              .default(dayjs().year()),
          }),
          response: {
            200: z.object({
              totalCreditCardsAvailableLimit: z.number(),
              nextInvoiceDueDate: z.string().nullable(),
              summaryOfInvoicesForTheSelectedMonth: z.object({
                totalInvoiceAmount: z.number(),
                invoicePaymentAmount: z.number(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        await request.getCurrentUserId()
        const creditCardService = new CreditCardService()
        const { slug } = request.params
        const { organization } = await request.getUserMembership(slug)
        const { month, year } = request.body

        const settedMonth = dayjs()
          .set('year', year)
          .set('month', month - 1)

        const totalCreditCardsAvailableLimit =
          await creditCardService.getCreditCardsAvailableLimit({
            creditCardIds: null,
            organizationId: organization.id,
          })

        // fatura atual
        // faturas do mes

        const today = dayjs()

        const nextInvoice = await prisma.creditCardInvoice.aggregate({
          where: {
            creditCard: {
              organizationId: organization.id,
            },
            dueDate: {
              gte: today.startOf('month').format('YYYY-MM-DD'),
              // lte: today.endOf('month').format('YYYY-MM-DD'),
            },
          },
          _min: {
            dueDate: true,
          },
        })

        const nextInvoiceDueDate = nextInvoice._min.dueDate

        // criar uma função no service para pegar o valor de qualquer fatura ou faturas dado a data

        const { totalTransactionsValue, totalPaymentsValue } =
          await creditCardService.getTotalAmountOfCreditCardTransactionsAndPayments(
            {
              creditCardIds: null,
              organizationId: organization.id,
              invoiceId: null,
              startDate: null,
              endDate: null,
              // startDate: settedMonth.startOf('month').format('YYYY-MM-DD'),
              // endDate: settedMonth.endOf('month').format('YYYY-MM-DD'),
              invoiceMonth: settedMonth.month() + 1,
              invoiceYear: settedMonth.year(),
            },
          )

        return reply.status(200).send({
          totalCreditCardsAvailableLimit:
            totalCreditCardsAvailableLimit.getAmount() / 100,
          nextInvoiceDueDate,
          summaryOfInvoicesForTheSelectedMonth: {
            totalInvoiceAmount: totalTransactionsValue.getAmount() / 100,
            invoicePaymentAmount: totalPaymentsValue.getAmount() / 100,
          },
        })
      },
    )
}
