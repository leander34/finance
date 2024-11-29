import { CreditCardFlag } from '@prisma/client'
import { dayjs } from '@saas/core'
import dinero from 'dinero.js'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { CreditCardService } from '@/application/service/credit-card-service'
import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function fetchCreditCardsWidget(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .get(
      '/organizations/:slug/credit-cards/widget',
      {
        schema: {
          tags: ['Credit Credits'],
          summary: 'Fetch credit cards widget.',
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              amountOfCreditCards: z.number(),
              creditCards: z.array(
                z.object({
                  id: z.string().uuid(),
                  organizationId: z.string().uuid(),
                  name: z.string(),
                  color: z.string(),
                  imageUrl: z.string().url(),
                  flag: z.nativeEnum(CreditCardFlag),
                  limit: z.number(),
                  availableLimit: z.number(),
                  usedLimit: z.number(),
                  usedLimitInPercentage: z.number(),
                  invoiceClosingDate: z.number(),
                  invoiceDueDate: z.number(),
                  currentInvoice: z
                    .object({
                      id: z.string().uuid(),
                      periodStart: z.string(),
                      periodEnd: z.string(),
                      dueDate: z.string(),
                      currentInvoiceAmount: z.number(),
                      month: z.number(),
                      year: z.number(),
                    })
                    .nullable(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        await request.getCurrentUserId()
        const creditCardService = new CreditCardService()

        const { slug } = request.params
        const { organization } = await request.getUserMembership(slug)
        const today = dayjs().format('YYYY-MM-DD')

        const creditCardsPrisma = await prisma.creditCard.findMany({
          where: {
            organizationId: organization.id,
          },
          select: {
            id: true,
            organizationId: true,
            color: true,
            name: true,
            limit: true,
            flag: true,
            invoiceClosingDate: true,
            invoiceDueDate: true,
            defaultPaymentAccount: {
              select: {
                bank: {
                  select: {
                    imageUrl: true,
                  },
                },
              },
            },
            invoices: {
              select: {
                id: true,
                periodStart: true,
                periodEnd: true,
                dueDate: true,
                month: true,
                year: true,
              },
              where: {
                periodStart: {
                  lte: today,
                },
                periodEnd: {
                  gte: today,
                },
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
          take: 3,
        })

        const financialAccountsPromisse = creditCardsPrisma.map(
          async ({ defaultPaymentAccount, ...creditCard }) => {
            // const { totalTransactionsValue, totalPaymentsValue } =
            //   await creditCardService.getCurrentCreditCardInvoice(
            //     {
            //       creditCardIds: [creditCard.id],
            //       organizationId: organization.id,
            //       startDate: null,
            //       endDate: null,
            //     },
            //   )
            const invoice = creditCard.invoices[0]

            const {
              totalTransactionsValue: totalTransactionsValueOnTheCurrentInvoice,
              totalPaymentsValue: totalPaymentsValueOnTheCurrentInvoice,
            } =
              await creditCardService.getTotalAmountOfCreditCardTransactionsAndPayments(
                {
                  creditCardIds: [creditCard.id],
                  organizationId: organization.id,
                  invoiceId: invoice?.id ?? null,
                  startDate: null,
                  endDate: null,
                  invoiceMonth: null,
                  invoiceYear: null,
                },
              )

            const currentInvoiceAmount =
              totalTransactionsValueOnTheCurrentInvoice.subtract(
                totalPaymentsValueOnTheCurrentInvoice,
              )

            const { totalTransactionsValue, totalPaymentsValue } =
              await creditCardService.getTotalAmountOfCreditCardTransactionsAndPayments(
                {
                  creditCardIds: [creditCard.id],
                  organizationId: organization.id,
                  invoiceId: null,
                  startDate: null,
                  endDate: null,
                  invoiceMonth: null,
                  invoiceYear: null,
                  futureTransaction: false,
                },
              )

            const usedLimit =
              totalTransactionsValue.subtract(totalPaymentsValue)

            const availableLimit = dinero({
              amount: creditCard.limit.toNumber(),
              currency: 'BRL',
            }).subtract(usedLimit)

            return {
              ...creditCard,
              imageUrl: defaultPaymentAccount.bank.imageUrl,
              limit: creditCard.limit.toNumber() / 100,
              availableLimit: availableLimit.getAmount() / 100,
              usedLimit: usedLimit.getAmount() / 100,
              usedLimitInPercentage:
                (usedLimit.getAmount() /
                  100 /
                  (creditCard.limit.toNumber() / 100)) *
                100,
              currentInvoice: invoice
                ? {
                    ...invoice,
                    currentInvoiceAmount:
                      currentInvoiceAmount.getAmount() / 100,
                  }
                : null,
            }
          },
        )

        const creditCards = await Promise.all(financialAccountsPromisse)

        const amountOfCreditCards = await prisma.creditCard.count({
          where: {
            organizationId: organization.id,
          },
        })

        return reply.status(200).send({
          amountOfCreditCards,
          creditCards,
        })
      },
    )
}
