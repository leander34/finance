import { type Prisma, TransactionStatus, TransactionType } from '@prisma/client'
import { dayjs } from '@saas/core'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import type {
  InvoicePaymentStatus,
  InvoiceStatus,
} from '@/@types/invoice-status-type'
import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function fetchTransactions(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .post(
      '/organizations/:slug/transactions/list',
      {
        schema: {
          tags: ['Transactions'],
          summary: 'Fetch all transactions',
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
          }),
          body: z.object({
            page: z.coerce.number().optional().default(1),
            type: z.array(z.nativeEnum(TransactionType)).nullish(),
            status: z.nativeEnum(TransactionStatus).optional(),
            degreeOfNeed: z.number().optional(),
            category: z.string().uuid().optional(),
            visibledInOverallBalance: z.boolean().nullish().default(null),
            startDate: z
              .string()
              .optional()
              .refine(
                (value) => {
                  if (!value) return true
                  const validFormat = 'YYYY-MM-DD'
                  const isDateValid = dayjs(value, validFormat, true).isValid()
                  return isDateValid
                },
                {
                  path: ['startDate'],
                  message: 'Formato da data inválido.',
                },
              ),
            endDate: z
              .string()
              .optional()
              .refine(
                (value) => {
                  if (!value) return true
                  const validFormat = 'YYYY-MM-DD'
                  const isDateValid = dayjs(value, validFormat, true).isValid()
                  return isDateValid
                },
                {
                  path: ['endDate'],
                  message: 'Formato da data inválido.',
                },
              ),
          }),
          response: {
            // 200: z.any(),
            200: z.object({
              amountOfPages: z.number(),
              amountOfTransactions: z.number(),
              transactions: z.array(
                z.object({
                  id: z.string().uuid(),
                  organizationId: z.string().uuid(),
                  description: z.string(),
                  status: z.nativeEnum(TransactionStatus),
                  type: z.nativeEnum(TransactionType),
                  realizationDate: z.string(),
                  amount: z.number(),
                  degreeOfNeed: z.number().nullable(),
                  observation: z.string().nullable(),
                  // paidAt: z.date().nullable(),
                  transactionPaymentType: z.string(),
                  expectedPaymentDate: z.string(),
                  calculatedTransactionStatus: z.string(),
                  creditCardId: z.string().uuid().nullable(),
                  financialAccountId: z.string().uuid().nullable(),
                  recurrenceId: z.string().uuid().nullable(),
                  installmentNumber: z.number().nullable(),
                  creditCardInvoice: z
                    .object({
                      id: z.string(),
                      creditCardId: z.string(),
                      periodStart: z.string(),
                      periodEnd: z.string(),
                      dueDate: z.string(),
                      month: z.number(),
                      year: z.number(),
                      createdAt: z.date(),
                      updatedAt: z.date(),
                      deletedAt: z.date().nullable(),
                    })
                    .nullable(),
                  financialAccount: z
                    .object({
                      id: z.string().uuid(),
                      name: z.string(),
                      imageUrl: z.string().url(),
                    })
                    .nullable(),
                  creditCard: z
                    .object({
                      id: z.string().uuid(),
                      name: z.string(),
                      imageUrl: z.string().url(),
                    })
                    .nullable(),
                  tags: z.array(
                    z.object({
                      id: z.string().uuid(),
                      name: z.string(),
                    }),
                  ),
                  category: z
                    .object({
                      id: z.string().uuid(),
                      name: z.string(),
                      icon: z.string(),
                      color: z.string(),
                      description: z.string().nullable(),
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

        const { slug } = request.params
        const { organization } = await request.getUserMembership(slug)

        const { startDate, endDate, type, page, visibledInOverallBalance } =
          request.body

        const where: Prisma.TransactionWhereInput = {
          organizationId: organization.id,
          type: type
            ? {
                in: type,
              }
            : undefined,
          OR:
            visibledInOverallBalance === null
              ? undefined
              : [
                  {
                    financialAccount: {
                      visibledInOverallBalance,
                    },
                  },
                  {
                    creditCard: {
                      defaultPaymentAccount: {
                        visibledInOverallBalance,
                      },
                    },
                  },
                ],
          realizationDate: {
            gte: startDate,
            lte: endDate,
          },
        }

        const transactions = await prisma.transaction.findMany({
          where,
          take: 10,
          skip: (page - 1) * 10,
          // orderBy: {
          //   realizationDate: 'asc',
          //   // description: 'asc',
          // },
          orderBy: [
            {
              realizationDate: 'desc',
            },
            {
              createdAt: 'desc',
            },
            {
              description: 'desc',
            },
          ],
          select: {
            id: true,
            organizationId: true,
            status: true,
            type: true,
            realizationDate: true,
            amount: true,
            degreeOfNeed: true,
            description: true,
            observation: true,
            // paidAt: true,
            creditCardId: true,
            financialAccountId: true,
            destinationFinancialAccountId: true,
            recurrenceId: true,
            installmentNumber: true,
            creditCardInvoice: true,
            destinationFinancialAccount: {
              select: {
                id: true,
                name: true,
                bank: {
                  select: {
                    imageUrl: true,
                  },
                },
              },
            },
            financialAccount: {
              select: {
                id: true,
                name: true,
                bank: {
                  select: {
                    imageUrl: true,
                  },
                },
              },
            },
            installment: true,
            creditCard: {
              select: {
                id: true,
                name: true,
                installments: true,
                defaultPaymentAccount: {
                  select: {
                    bank: {
                      select: {
                        imageUrl: true,
                      },
                    },
                  },
                },
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                icon: true,
                color: true,
                description: true,
              },
            },
            transactionsTags: {
              select: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        })

        const amountOfTransactions = await prisma.transaction.count({
          where,
        })

        const transactionPromiseMapped = transactions.map(
          async ({
            transactionsTags,
            financialAccount,
            destinationFinancialAccount,
            creditCard,
            creditCardInvoice,
            ...transaction
          }) => {
            if (transaction.type === 'TRANSFER') {
              const transactionPaymentType: string = transaction.recurrenceId
                ? 'Fixa'
                : 'Única'
              return [
                {
                  ...transaction,
                  description: `Transferência de "${financialAccount?.name}"`,
                  financialAccountId: transaction.destinationFinancialAccountId,
                  transactionPaymentType,
                  expectedPaymentDate: transaction.realizationDate,
                  calculatedTransactionStatus: 'PAID',
                  amount: transaction.amount.toNumber() / 100,
                  financialAccount: destinationFinancialAccount
                    ? {
                        id: destinationFinancialAccount.id,
                        name: destinationFinancialAccount.name,
                        imageUrl: destinationFinancialAccount.bank.imageUrl,
                      }
                    : null,
                  creditCard: null,
                  creditCardInvoice: null,
                  tags: transactionsTags.map((item) => ({
                    id: item.tag.id,
                    name: item.tag.name,
                  })),
                },
                {
                  ...transaction,
                  description: `Transferência para "${destinationFinancialAccount?.name}"`,
                  transactionPaymentType,
                  expectedPaymentDate: transaction.realizationDate,
                  calculatedTransactionStatus: 'PAID',
                  amount: (transaction.amount.toNumber() / 100) * -1,
                  financialAccount: financialAccount
                    ? {
                        id: financialAccount.id,
                        name: financialAccount.name,
                        imageUrl: financialAccount.bank.imageUrl,
                      }
                    : null,
                  creditCard: null,
                  creditCardInvoice: null,
                  tags: transactionsTags.map((item) => ({
                    id: item.tag.id,
                    name: item.tag.name,
                  })),
                },
              ]
            } else {
              let transactionPaymentType: string = 'Única'
              if (transaction.creditCardId) {
                transactionPaymentType =
                  transaction.installment?.totalNumberOfInstallments &&
                  transaction.installment.totalNumberOfInstallments > 1
                    ? `Parcela ${transaction.installmentNumber} de ${transaction.installment.totalNumberOfInstallments}`
                    : 'Parcela única'
              }

              if (transaction.recurrenceId) {
                transactionPaymentType = 'Fixa'
              }

              const expectedPaymentDate: string =
                transaction.creditCardId && creditCardInvoice
                  ? creditCardInvoice.dueDate
                  : transaction.realizationDate

              // expectedPaymentDate =
              //   transaction.type !== 'EXPENSE' ? null : expectedPaymentDate

              const invoiceId = creditCardInvoice?.id
              let calculatedTransactionStatus:
                | 'OPEN'
                | 'PAST_DUE_DATE'
                | 'PAID' = 'OPEN'

              // let invoiceStatus: 'PAID' | 'UNPAID' | 'PAST_DUE_DATE' = 'UNPAID'
              // VENCIDA PAGA ABERTA

              if (invoiceId) {
                const invoice = await prisma.creditCardInvoice.findUnique({
                  where: {
                    id: invoiceId,
                  },
                  include: {
                    // transactions: {
                    //   where: {
                    //     futureTransaction: false,
                    //   },
                    // },
                    transactions: true,
                    invoicePayments: true,
                  },
                })
                const today = dayjs()
                const totalInvoiceExpensesValue = invoice
                  ? invoice.transactions.reduce((sum, item) => {
                      return sum + item.amount.toNumber() * -1
                    }, 0)
                  : 0

                const totalInvoicePaymentsValue = invoice
                  ? invoice.invoicePayments.reduce((sum, item) => {
                      return sum + item.amount.toNumber() * -1
                    }, 0)
                  : 0

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
                  const pastDueDate = today.isAfter(
                    dayjs(invoice.dueDate),
                    'date',
                  )
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
                    totalInvoiceExpensesValue > 0 &&
                    totalInvoicePaymentsValue === 0

                  if (fullyPaid) {
                    invoicePaymentStatus = 'FULLY_PAID'
                  }

                  if (partiallyPaid) {
                    invoicePaymentStatus = 'PARTIALLY_PAID'
                  }

                  if (unpaid) {
                    invoicePaymentStatus = 'UNPAID'
                  }

                  if (
                    invoiceStatus === 'PAST_DUE_DATE' &&
                    invoicePaymentStatus !== 'FULLY_PAID'
                  ) {
                    calculatedTransactionStatus = 'PAST_DUE_DATE'
                  }

                  if (invoiceStatus === 'OPEN') {
                    calculatedTransactionStatus = 'OPEN'
                  }

                  if (
                    invoiceStatus !== 'OPEN' &&
                    invoiceStatus !== 'NOT_OPEN' &&
                    invoicePaymentStatus === 'FULLY_PAID'
                  ) {
                    calculatedTransactionStatus = 'PAID'
                  }
                }

                //   const paid = transactions.equalsTo(payments)

                //   {transaction.status === 'PAID' && (
                //   <Badge variant="paid">Pago</Badge>
                // )}
                // {transaction.status === 'UNPAID' &&
                //   dayjs().isAfter(dayjs(transaction.realizationDate), 'date') && (
                //     <Badge variant="pastDueDate">Vencido</Badge>
                //   )}

                // {transaction.status === 'UNPAID' &&
                //   (dayjs().isBefore(dayjs(transaction.realizationDate), 'date') ||
                //     dayjs().isSame(dayjs(transaction.realizationDate), 'date')) && (
                //     <Badge variant="unpaid">Em aberto</Badge>
                //   )}

                //   // calculos

                //   invoiceStatus = 'PAID'
              } else {
                if (transaction.status === 'PAID') {
                  calculatedTransactionStatus = 'PAID'
                }

                if (
                  transaction.status === 'UNPAID' &&
                  dayjs().isAfter(dayjs(transaction.realizationDate), 'date')
                ) {
                  calculatedTransactionStatus = 'PAST_DUE_DATE'
                }

                if (
                  transaction.status === 'UNPAID' &&
                  (dayjs().isBefore(
                    dayjs(transaction.realizationDate),
                    'date',
                  ) ||
                    dayjs().isSame(dayjs(transaction.realizationDate), 'date'))
                ) {
                  calculatedTransactionStatus = 'OPEN'
                }
              }

              // let description = transaction.description

              // if (
              //   transaction.type === 'POSITIVE_ADJUSTMENT' ||
              //   transaction.type === 'NEGATIVE_ADJUSTMENT'
              // ) {
              //   description =
              //     `${description} (Reajuste de saldo)` || 'Reajuste de saldo'
              // }

              return {
                ...transaction,
                transactionPaymentType,
                expectedPaymentDate,
                calculatedTransactionStatus,
                amount: transaction.amount.toNumber() / 100,
                financialAccount: financialAccount
                  ? {
                      id: financialAccount.id,
                      name: financialAccount.name,
                      imageUrl: financialAccount.bank.imageUrl,
                    }
                  : null,
                creditCard: creditCard
                  ? {
                      id: creditCard.id,
                      name: creditCard.name,
                      imageUrl: creditCard.defaultPaymentAccount.bank.imageUrl,
                    }
                  : null,
                creditCardInvoice,
                tags: transactionsTags.map((item) => ({
                  id: item.tag.id,
                  name: item.tag.name,
                })),
              }
            }
          },
        )

        const transactionMapped = (
          await Promise.all(transactionPromiseMapped)
        ).flat()
        // console.log(transactionMapped)

        // const transactionMapped: {
        //     tags: {
        //         id: string;
        //         name: string;
        //     }[];
        //     id: string;
        //     amount: Prisma.Decimal;
        //     description: string;
        //     observation: string | null;
        //     type: $Enums.TransactionType;
        //     status: $Enums.TransactionStatus;
        //     realizationDate: string;
        //     paidAt: Date | null;
        //     degreeOfNeed: number | null;
        //     category: {
        //         ...;
        //     } | null;
        // }[]

        return reply.status(200).send({
          amountOfPages: Math.ceil(amountOfTransactions / 10),
          amountOfTransactions,
          transactions: transactionMapped,
        })
      },
    )
}
