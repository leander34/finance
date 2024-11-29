import { CreditCardFlag, type Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import dinero from 'dinero.js'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import {
  type InvoicePaymentStatus,
  invoicePaymentStatusSchema,
  type InvoiceStatus,
  invoiceStatusSchema,
} from '@/@types/invoice-status-type'
import { CreditCardService } from '@/application/service/credit-card-service'
import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'

export async function fetchCreditCardsWithDetails(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .post(
      '/organizations/:slug/credit-cards/details',
      {
        schema: {
          tags: ['Credit Cards'],
          summary: 'Fetch credit cards with details',
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
              amountOfCreditCards: z.number(),
              amountOfPages: z.number(),
              creditCards: z.array(
                z.object({
                  id: z.string().uuid(),
                  financialAccount: z.object({
                    id: z.string().uuid(),
                    name: z.string(),
                    bank: z.object({
                      id: z.string().uuid(),
                      name: z.string(),
                      imageUrl: z.string().url(),
                    }),
                  }),
                  name: z.string(),
                  flag: z.nativeEnum(CreditCardFlag),
                  limit: z.number(),
                  availableLimit: z.number(),
                  usedLimit: z.number(),
                  usedLimitInPercentage: z.number(),
                  invoiceClosingDate: z.number(),
                  invoiceDueDate: z.number(),
                  color: z.string(),
                  archivedAt: z.date().nullable(),
                  blockedByExpiredSubscription: z.boolean(),
                  description: z.string().nullable(),
                  createdAt: z.date(),
                  invoice: z
                    .object({
                      status: invoiceStatusSchema,
                      invoicePaymentStatus: invoicePaymentStatusSchema,
                      totalInvoiceExpensesValue: z.number(),
                      totalInvoicePaymentsValue: z.number(),
                      currentInvoiceValue: z.number(),
                      id: z.string().uuid(),
                      creditCardId: z.string().uuid(),
                      periodStart: z.string(),
                      periodEnd: z.string(),
                      dueDate: z.string(),
                      createdAt: z.date(),
                      updatedAt: z.date(),
                      deletedAt: z.date().nullable(),
                      amountOfTransactions: z.number(),
                      amountOfPayments: z.number(),
                      lastInvoicePaymentDate: z.string().nullable(),
                      lastInvoicePaymentAmount: z.number().nullable(),
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
        const { month, year } = request.body

        const settedMonth = dayjs()
          .set('year', year)
          .set('month', month - 1)

        const where: Prisma.CreditCardWhereInput = {
          organizationId: organization.id,
        }

        const creditCards = await prisma.creditCard.findMany({
          where,
          select: {
            id: true,
            archivedAt: true,
            color: true,
            createdAt: true,
            description: true,
            flag: true,
            name: true,
            invoiceClosingDate: true,
            invoiceDueDate: true,
            limit: true,
            blockedByExpiredSubscription: true,
            defaultPaymentAccount: {
              select: {
                id: true,
                name: true,
                bank: {
                  select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                  },
                },
              },
            },
            invoices: {
              where: {
                // dueDate: {
                //   lte: settedMonth.endOf('month').format('YYYY-MM-DD'),
                //   gte: settedMonth.startOf('month').format('YYYY-MM-DD'),
                // },
                month: settedMonth.month() + 1,
                year: settedMonth.year(),
              },
              include: {
                transactions: true,
                invoicePayments: {
                  orderBy: [
                    {
                      realizationDate: 'desc',
                    },
                    {
                      createdAt: 'desc',
                    },
                  ],
                },
              },
            },
          },
        })

        const creditCardsMappedPromise = creditCards.map(async (creditCard) => {
          const invoice = creditCard.invoices[0]
          const totalInvoiceExpensesValue =
            invoice?.transactions?.reduce((sum, item) => {
              return sum + item.amount.toNumber() * -1
            }, 0) ?? 0

          const totalInvoicePaymentsValue =
            invoice?.invoicePayments?.reduce((sum, item) => {
              return sum + item.amount.toNumber() * -1
            }, 0) ?? 0

          const today = dayjs()
          let invoiceStatus: InvoiceStatus = 'NOT_OPEN'
          let invoicePaymentStatus: InvoicePaymentStatus = null

          if (invoice) {
            const open = today.isBetween(
              dayjs(invoice.periodStart),
              dayjs(invoice.periodEnd),
              'day',
              '[]',
            )
            const closed = today.isBetween(
              dayjs(invoice.periodEnd),
              dayjs(invoice.dueDate),
              'day',
              '(]',
            )
            // const pastDueDate = dayjs(invoice.dueDate).isBefore(today, 'date')
            const pastDueDate = today.isAfter(dayjs(invoice.dueDate), 'date')
            const notOpen =
              dayjs(invoice.periodStart).isAfter(dayjs()) &&
              !open &&
              !closed &&
              !pastDueDate

            if (open) {
              invoiceStatus = 'OPEN'
            }

            if (closed) {
              invoiceStatus = 'CLOSED'
            }

            if (pastDueDate) {
              invoiceStatus = 'PAST_DUE_DATE'
            }

            if (notOpen) {
              invoiceStatus = 'NOT_OPEN'
            }

            const fullyPaid =
              totalInvoiceExpensesValue === totalInvoicePaymentsValue

            const partiallyPaid =
              totalInvoiceExpensesValue > totalInvoicePaymentsValue &&
              totalInvoicePaymentsValue > 0

            const unpaid =
              totalInvoiceExpensesValue > 0 && totalInvoicePaymentsValue === 0

            if (fullyPaid) {
              invoicePaymentStatus = 'FULLY_PAID'
            }

            if (partiallyPaid) {
              invoicePaymentStatus = 'PARTIALLY_PAID'
            }

            if (unpaid) {
              invoicePaymentStatus = 'UNPAID'
            }

            // verificar não tem como algo estar not open e fully paid
            // a fatura só pode ser dita que está paga quando esta fully paid e closed (ou vencida)
            // se a fatura é not open mostrar o status igual a parcial
          }

          // limit do cartao
          // valor total das transactions de todas as faturas (do cartao) - os pagamentos de todas as faturas (do cartao)

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

          const usedLimit = totalTransactionsValue.subtract(totalPaymentsValue)

          const availableLimit = dinero({
            amount: creditCard.limit.toNumber(),
            currency: 'BRL',
          }).subtract(usedLimit)

          // const { transactions, invoicePayments, ...rest } = invoice
          // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
          let newInvoice: any = invoice
          if (newInvoice) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { transactions, invoicePayments, ...rest } = invoice
            newInvoice = rest
          }

          return {
            id: creditCard.id,
            financialAccount: {
              id: creditCard.defaultPaymentAccount.id,
              name: creditCard.defaultPaymentAccount.name,
              bank: {
                id: creditCard.defaultPaymentAccount.bank.id,
                name: creditCard.defaultPaymentAccount.bank.name,
                imageUrl: creditCard.defaultPaymentAccount.bank.imageUrl,
              },
            },
            name: creditCard.name,
            flag: creditCard.flag,
            limit: creditCard.limit.toNumber() / 100,
            availableLimit: availableLimit.getAmount() / 100,
            usedLimit: usedLimit.getAmount() / 100,
            usedLimitInPercentage:
              (usedLimit.getAmount() /
                100 /
                (creditCard.limit.toNumber() / 100)) *
              100,
            invoiceClosingDate: creditCard.invoiceClosingDate,
            invoiceDueDate: creditCard.invoiceDueDate,
            color: creditCard.color,
            archivedAt: creditCard.archivedAt,
            blockedByExpiredSubscription:
              creditCard.blockedByExpiredSubscription,
            description: creditCard.description,
            createdAt: creditCard.createdAt,
            invoice: invoice
              ? {
                  status: invoiceStatus,
                  invoicePaymentStatus,
                  totalInvoiceExpensesValue:
                    totalInvoiceExpensesValue === 0
                      ? 0
                      : totalInvoiceExpensesValue / 100,
                  totalInvoicePaymentsValue:
                    totalInvoicePaymentsValue === 0
                      ? 0
                      : totalInvoicePaymentsValue / 100,
                  currentInvoiceValue:
                    (totalInvoiceExpensesValue - totalInvoicePaymentsValue) /
                    100,
                  amountOfTransactions: invoice.transactions.length,
                  amountOfPayments: invoice.invoicePayments.length,
                  lastInvoicePaymentDate:
                    invoice.invoicePayments?.[0]?.realizationDate ?? null,
                  lastInvoicePaymentAmount: invoice.invoicePayments[0]
                    ? (invoice.invoicePayments[0].amount.toNumber() * -1) / 100
                    : null,

                  ...newInvoice,
                }
              : null,
          }
        })

        const amountOfCreditCards = await prisma.creditCard.count({
          where,
        })

        const creditCardsMapped = await Promise.all(creditCardsMappedPromise)

        return reply.status(200).send({
          amountOfCreditCards,
          amountOfPages: Math.ceil(amountOfCreditCards / 10),
          creditCards: creditCardsMapped,
        })
      },
    )
}
