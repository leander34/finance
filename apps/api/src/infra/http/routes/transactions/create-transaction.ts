import { TransactionType } from '@prisma/client'
import {
  BadRequestError,
  dayjs,
  getCurrentActivePlan,
  RESOLVED_PLAN_NAMES,
  ResourceNotFoundError,
} from '@saas/core'
import dinero from 'dinero.js'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { installmentPeriodSchema } from '@/@types/installment-period'
import { recurrencePeriodSchema } from '@/@types/recurrence-period'
import { prisma } from '@/infra/database/prisma'
import { calcInstallments } from '@/utils/calc-installments'
import { calcNextInstallmentDate } from '@/utils/calc-next-installment-date'
import { calcNextRecurrenceDate } from '@/utils/calc-next-recurrence-date'
import { generateInvoice } from '@/utils/generate-invoice'
import { getAmountRecurrenceRepetition } from '@/utils/get-amount-recurrence-repetition'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function createTransaction(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .post(
      '/organizations/:slug/transactions',
      {
        schema: {
          tags: ['Transactions'],
          summary: 'Create a transaction',
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
          }),
          body: z
            .object({
              type: z.nativeEnum(TransactionType, {
                required_error: 'O tipo da transação é obrigatório.',
                invalid_type_error: 'Tipo da transação inválido.',
                message: 'Tipo da transação inválido.',
              }),
              amount: z
                .number({
                  coerce: true,
                  invalid_type_error: 'Valor da transação inválido.',
                })
                .refine((value) => value !== 0, {
                  message: 'O valor da transação não pode ser zero.',
                }),
              realizationDate: z
                .string({
                  required_error: 'O campo data de realização é obrigatório.',
                })
                .refine(
                  (value) => {
                    const validFormat = 'YYYY-MM-DD'
                    const isDateValid = dayjs(
                      value,
                      validFormat,
                      true,
                    ).isValid()
                    return isDateValid
                  },
                  {
                    path: ['realizationDate'],
                    message: 'Formato da data inválido.',
                  },
                ),
              degreeOfNeed: z
                .number({
                  coerce: true,
                  invalid_type_error: 'Grau de necessidade inválido.',
                })
                .nullish()
                .default(null),
              skip: z.coerce.boolean().default(false),
              description: z.string(),
              observation: z.string().nullish(),
              alreadyPaid: z.coerce.boolean().default(true),
              financialAccountId: z
                .string()
                .uuid({ message: 'Id inválido.' })
                .optional(),
              creditCardId: z
                .string()
                .uuid({ message: 'Id inválido.' })
                .optional(),
              launchType: z
                .union([
                  z.literal('SINGLE_LAUNCH'),
                  z.literal('INSTALLMENT_LAUNCH'),
                  z.literal('RECURRENT_LAUNCH'),
                ])
                .default('SINGLE_LAUNCH'),
              recurrencePeriod: recurrencePeriodSchema
                .default('mensal')
                .nullish(),
              amountOfInstallments: z.coerce.number().nullish(),
              installmentsPeriod: installmentPeriodSchema
                .default('meses')
                .nullish(),
              tags: z.array(z.string().uuid()).nullish().default([]),
              category: z.string().uuid().nullish(),
            })
            .refine(
              (data) => {
                if (!data.financialAccountId && !data.creditCardId) {
                  return false
                }

                if (data.financialAccountId && data.creditCardId) {
                  return false
                }

                return true
              },
              {
                message: 'Conta e cartão enviados juntos ou nenhum enviado.',
                path: ['financialAccountId', 'creditCardId'],
              },
            )
            .refine(
              (data) => {
                if (data.type === 'EXPENSE' && data.amount > 0) return false
                if (data.type === 'REVENUE' && data.amount < 0) return false
                return true
              },
              {
                message:
                  'Valor da transação não corresponde com o tipo escolhido.',
                path: ['financialAccountId', 'creditCardId'],
              },
            )
            .refine(
              (data) => {
                if (data.type === 'REVENUE' && data.degreeOfNeed) return false
                if (
                  data.type === 'EXPENSE' &&
                  (!data.degreeOfNeed || ![1, 2, 3].includes(data.degreeOfNeed))
                )
                  return false
                return true
              },
              {
                path: ['degreeOfNeed'],
                message: 'Grau de necessidade inválido.',
              },
            )
            .refine(
              (data) => {
                if (
                  data.launchType === 'RECURRENT_LAUNCH' &&
                  !data.recurrencePeriod
                ) {
                  return false
                }
                return true
              },
              {
                path: ['recurrencePeriod'],
                message:
                  'Por favor, selecione uma frequência de repetição para a despesa fixa.',
              },
            )
            .refine(
              (data) => {
                if (
                  data.launchType === 'INSTALLMENT_LAUNCH' &&
                  (!data.amountOfInstallments || !data.installmentsPeriod)
                ) {
                  return false
                }
                return true
              },
              {
                path: ['amountOfInstallments', 'installmentsPeriod'],
                message:
                  'Por favor, selecione a quantidade de parcela e a frequência de repetição',
              },
            )
            .refine(
              (data) => {
                if (data.type !== 'EXPENSE' && data.creditCardId) {
                  return false
                }
                return true
              },
              {
                path: ['type'],
                message: 'Lançamentos no cartão deve ser do tipo despesa.',
              },
            ),
          response: {
            201: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { slug } = request.params
        const { organization } = await request.getUserMembership(slug)
        const {
          type,
          amount,
          alreadyPaid,
          realizationDate,
          degreeOfNeed,
          skip,
          description,
          financialAccountId,
          creditCardId,
          category,
          tags,
          launchType,
          amountOfInstallments,
          installmentsPeriod,
          recurrencePeriod,
          observation,
        } = request.body

        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            subscription: true,
          },
        })

        if (!user) {
          throw new ResourceNotFoundError('pt-br.notFound.user')
        }

        if (financialAccountId) {
          const financialAccount = await prisma.financialAccount.findUnique({
            where: {
              id: financialAccountId,
              organizationId: organization.id,
            },
          })

          if (!financialAccount) {
            throw new ResourceNotFoundError('pt-br.notFound.financial-account')
          }

          if (financialAccount.blockedByExpiredSubscription) {
            throw new BadRequestError(
              'pt-br.financial-account.blocked-by-expired-subscription',
            )
          }
        }

        if (creditCardId) {
          const creditCard = await prisma.creditCard.findUnique({
            where: {
              id: creditCardId,
              organizationId: organization.id,
            },
          })

          if (!creditCard) {
            throw new ResourceNotFoundError('pt-br.notFound.credit-card')
          }

          if (creditCard.blockedByExpiredSubscription) {
            throw new BadRequestError(
              'pt-br.credit-card.blocked-by-expired-subscription',
            )
          }
        }

        const totalTransactionCreatedToday = await prisma.transaction.count({
          where: {
            organizationId: organization.id,
            type: {
              in: ['REVENUE', 'EXPENSE'],
            },
            createdAt: {
              gte: dayjs().startOf('day').toDate(),
              lte: dayjs().endOf('day').toDate(),
            },
          },
        })

        const currentActivePlan = getCurrentActivePlan({
          resolvedPlan: user.subscription?.resolvedPlan as
            | RESOLVED_PLAN_NAMES
            | undefined,
          status: user.subscription?.status,
        })

        if (
          totalTransactionCreatedToday >=
          currentActivePlan.features.transactionLimitPerDay
        ) {
          throw new BadRequestError(
            'pt-br.transactions.daily-transaction-limit-reached',
          )
        }

        // const transactionService = makeTransactionService({  })

        const transactionValue = dinero({
          amount: Math.round(amount * 100),
          currency: 'BRL',
        })

        if (financialAccountId) {
          if (launchType === 'SINGLE_LAUNCH') {
            await prisma.transaction.create({
              data: {
                userId,
                organizationId: organization.id,
                financialAccountId,
                type,
                amount: transactionValue.getAmount(),
                status: alreadyPaid ? 'PAID' : 'UNPAID',
                // paidAt: alreadyPaid ? dayjs().toDate() : undefined,
                realizationDate,
                degreeOfNeed: degreeOfNeed ?? null,
                skip,
                description,
                categoryId: category ?? undefined,
                observation,
                transactionsTags: tags
                  ? {
                      createMany: {
                        data: tags.map((tag) => ({ tagId: tag })),
                      },
                    }
                  : undefined,
              },
            })
          }

          if (
            launchType === 'INSTALLMENT_LAUNCH' &&
            amountOfInstallments &&
            installmentsPeriod
          ) {
            await prisma.$transaction(async (tx) => {
              const installmentCreated = await tx.installment.create({
                data: {
                  organizationId: organization.id,
                  userId,
                  financialAccountId,
                  totalNumberOfInstallments: amountOfInstallments,
                  firstInstallmentDate: realizationDate,
                },
              })

              const installments = calcInstallments(
                transactionValue,
                amountOfInstallments,
              )

              let installmentRealizationDate = realizationDate

              let installmentNumber = 1

              for (const installment of installments) {
                await tx.transaction.create({
                  data: {
                    userId,
                    organizationId: organization.id,
                    financialAccountId,
                    type,
                    amount: installment.getAmount(),
                    status:
                      alreadyPaid && installmentNumber === 1
                        ? 'PAID'
                        : 'UNPAID',
                    realizationDate: installmentRealizationDate,
                    degreeOfNeed: degreeOfNeed ?? null,
                    skip,
                    description,
                    categoryId: category ?? undefined,
                    observation,
                    transactionsTags: tags
                      ? {
                          createMany: {
                            data: tags.map((tag) => ({ tagId: tag })),
                          },
                        }
                      : undefined,
                    installmentId: installmentCreated.id,
                    installmentNumber,
                  },
                })

                installmentRealizationDate = calcNextInstallmentDate(
                  installmentRealizationDate,
                  installmentsPeriod,
                )

                installmentNumber += 1
              }
            })
          }

          if (launchType === 'RECURRENT_LAUNCH' && recurrencePeriod) {
            // quantidade de repetição
            await prisma.$transaction(async (tx) => {
              const recurrence = await tx.recurrence.create({
                data: {
                  organizationId: organization.id,
                  userId,
                  amount: transactionValue.getAmount(),
                  description,
                  realizationDate,
                  type,
                  categoryId: category ?? undefined,
                  financialAccountId,
                  degreeOfNeed,
                  observation,
                  skip,
                  tags: tags
                    ? {
                        createMany: {
                          data: tags.map((tag) => ({ tagId: tag })),
                        },
                      }
                    : undefined,
                  frequency: recurrencePeriod,
                  lastRealizationDate: '',
                  nextDate: '',
                  endDate: null,
                  startDate: dayjs().format('YYYY-MM-DD'),
                  lastProcessingDate: dayjs().format('YYYY-MM-DD'),
                  day: dayjs(realizationDate).date(),
                },
              })
              const { recurrenceRepetition, interval } =
                getAmountRecurrenceRepetition(recurrencePeriod, realizationDate)
              let recurrenceRealizationDate = realizationDate

              for (let i = 0; i < recurrenceRepetition; i++) {
                await tx.transaction.create({
                  data: {
                    userId,
                    organizationId: organization.id,
                    financialAccountId,
                    recurrenceId: recurrence.id,
                    type,
                    amount: transactionValue.getAmount(),
                    status: alreadyPaid && i === 0 ? 'PAID' : 'UNPAID',
                    realizationDate: recurrenceRealizationDate,
                    degreeOfNeed: degreeOfNeed ?? null,
                    skip,
                    description,
                    categoryId: category ?? undefined,
                    observation,
                    futureTransaction: dayjs(recurrenceRealizationDate).isAfter(
                      dayjs(),
                    ),
                    transactionsTags: tags
                      ? {
                          createMany: {
                            data: tags.map((tag) => ({ tagId: tag })),
                          },
                        }
                      : undefined,
                  },
                })

                if (i + 1 !== recurrenceRepetition) {
                  recurrenceRealizationDate = calcNextRecurrenceDate(
                    recurrenceRealizationDate,
                    recurrencePeriod,
                    dayjs(realizationDate).date(),
                  )
                }
              }

              await tx.recurrence.update({
                where: {
                  id: recurrence.id,
                },
                data: {
                  lastRealizationDate: recurrenceRealizationDate,
                  nextDate: dayjs().add(interval, 'year').format('YYYY-MM-DD'),
                  endDate: null,
                },
              })
            })
          }
        }
        // Credit Card

        if (creditCardId) {
          if (launchType === 'SINGLE_LAUNCH') {
            let invoice = await prisma.creditCardInvoice.findFirst({
              where: {
                creditCardId,
                periodStart: {
                  lte: realizationDate,
                },
                periodEnd: {
                  gte: realizationDate,
                },
              },
            })

            if (!invoice) {
              const creditCard = (await prisma.creditCard.findUnique({
                where: {
                  id: creditCardId,
                  organizationId: organization.id,
                },
              }))!

              const { dueDate, month, periodEnd, periodStart, year } =
                generateInvoice({
                  baseRealizationDate: realizationDate,
                  invoiceClosingDate: creditCard.invoiceClosingDate,
                  invoiceDueDate: creditCard.invoiceDueDate,
                })

              invoice = await prisma.creditCardInvoice.create({
                data: {
                  creditCardId,
                  periodStart,
                  periodEnd,
                  dueDate,
                  month,
                  year,
                },
              })
            }

            await prisma.transaction.create({
              data: {
                userId,
                organizationId: organization.id,
                creditCardId,
                creditCardInvoiceId: invoice.id,
                type,
                amount: transactionValue.getAmount(),
                status: 'UNPAID',
                realizationDate,
                degreeOfNeed: degreeOfNeed ?? null,
                skip,
                description,
                categoryId: category ?? undefined,
                observation,
                transactionsTags: tags
                  ? {
                      createMany: {
                        data: tags.map((tag) => ({ tagId: tag })),
                      },
                    }
                  : undefined,
              },
            })
          }
          // pegar a fatura que essa compra deve ser colocada

          if (
            launchType === 'INSTALLMENT_LAUNCH' &&
            amountOfInstallments &&
            installmentsPeriod
          ) {
            await prisma.$transaction(async (tx) => {
              const installmentCreated = await tx.installment.create({
                data: {
                  organizationId: organization.id,
                  userId,
                  creditCardId,
                  totalNumberOfInstallments: amountOfInstallments,
                  firstInstallmentDate: realizationDate,
                },
              })

              const installments = calcInstallments(
                transactionValue,
                amountOfInstallments,
              )

              let installmentRealizationDate = realizationDate

              let installmentNumber = 1

              for (const installment of installments) {
                // fatura
                let invoice = await tx.creditCardInvoice.findFirst({
                  where: {
                    creditCardId,
                    periodStart: {
                      lte: installmentRealizationDate,
                    },
                    periodEnd: {
                      gte: installmentRealizationDate,
                    },
                  },
                })

                if (!invoice) {
                  const creditCard = (await tx.creditCard.findUnique({
                    where: {
                      id: creditCardId,
                      organizationId: organization.id,
                    },
                  }))!

                  const { dueDate, month, periodEnd, periodStart, year } =
                    generateInvoice({
                      baseRealizationDate: installmentRealizationDate,
                      invoiceClosingDate: creditCard.invoiceClosingDate,
                      invoiceDueDate: creditCard.invoiceDueDate,
                    })

                  invoice = await tx.creditCardInvoice.create({
                    data: {
                      creditCardId,
                      periodStart,
                      periodEnd,
                      dueDate,
                      month,
                      year,
                    },
                  })
                }
                //

                await tx.transaction.create({
                  data: {
                    userId,
                    organizationId: organization.id,
                    creditCardId,
                    creditCardInvoiceId: invoice.id,
                    type,
                    amount: installment.getAmount(),
                    status: 'UNPAID',
                    realizationDate: installmentRealizationDate,
                    degreeOfNeed: degreeOfNeed ?? null,
                    skip,
                    description,
                    categoryId: category ?? undefined,
                    observation,
                    transactionsTags: tags
                      ? {
                          createMany: {
                            data: tags.map((tag) => ({ tagId: tag })),
                          },
                        }
                      : undefined,
                    installmentId: installmentCreated.id,
                    installmentNumber,
                  },
                })

                installmentRealizationDate = calcNextInstallmentDate(
                  installmentRealizationDate,
                  installmentsPeriod,
                )

                installmentNumber += 1
              }
            })
          }

          if (launchType === 'RECURRENT_LAUNCH' && recurrencePeriod) {
            // quantidade de repetição
            await prisma.$transaction(
              async (tx) => {
                const recurrence = await tx.recurrence.create({
                  data: {
                    organizationId: organization.id,
                    userId,
                    amount: transactionValue.getAmount(),
                    description,
                    realizationDate,
                    type,
                    categoryId: category ?? undefined,
                    creditCardId,
                    degreeOfNeed,
                    observation,
                    skip,
                    tags: tags
                      ? {
                          createMany: {
                            data: tags.map((tag) => ({ tagId: tag })),
                          },
                        }
                      : undefined,
                    frequency: recurrencePeriod,
                    lastRealizationDate: '',
                    nextDate: '',
                    endDate: null,
                    startDate: dayjs().format('YYYY-MM-DD'),
                    lastProcessingDate: dayjs().format('YYYY-MM-DD'),
                    day: dayjs(realizationDate).date(),
                  },
                })
                const { recurrenceRepetition, interval } =
                  getAmountRecurrenceRepetition(
                    recurrencePeriod,
                    realizationDate,
                  )
                let recurrenceRealizationDate = realizationDate

                for (let i = 0; i < recurrenceRepetition; i++) {
                  let invoice = await tx.creditCardInvoice.findFirst({
                    where: {
                      creditCardId,
                      periodStart: {
                        lte: recurrenceRealizationDate,
                      },
                      periodEnd: {
                        gte: recurrenceRealizationDate,
                      },
                    },
                  })

                  if (!invoice) {
                    const creditCard = (await tx.creditCard.findUnique({
                      where: {
                        id: creditCardId,
                        organizationId: organization.id,
                      },
                    }))!

                    const { dueDate, month, periodEnd, periodStart, year } =
                      generateInvoice({
                        baseRealizationDate: recurrenceRealizationDate,
                        invoiceClosingDate: creditCard.invoiceClosingDate,
                        invoiceDueDate: creditCard.invoiceDueDate,
                      })

                    invoice = await tx.creditCardInvoice.create({
                      data: {
                        creditCardId,
                        periodStart,
                        periodEnd,
                        dueDate,
                        month,
                        year,
                      },
                    })
                  }

                  await tx.transaction.create({
                    data: {
                      userId,
                      organizationId: organization.id,
                      creditCardId,
                      creditCardInvoiceId: invoice.id,
                      recurrenceId: recurrence.id,
                      type,
                      amount: transactionValue.getAmount(),
                      status: 'UNPAID',
                      realizationDate: recurrenceRealizationDate,
                      degreeOfNeed: degreeOfNeed ?? null,
                      skip,
                      description,
                      categoryId: category ?? undefined,
                      observation,
                      futureTransaction: dayjs(
                        recurrenceRealizationDate,
                      ).isAfter(dayjs()),
                      transactionsTags: tags
                        ? {
                            createMany: {
                              data: tags.map((tag) => ({ tagId: tag })),
                            },
                          }
                        : undefined,
                    },
                  })

                  if (i + 1 !== recurrenceRepetition) {
                    recurrenceRealizationDate = calcNextRecurrenceDate(
                      recurrenceRealizationDate,
                      recurrencePeriod,
                      dayjs(realizationDate).date(),
                    )
                  }
                }

                await tx.recurrence.update({
                  where: {
                    id: recurrence.id,
                  },
                  data: {
                    lastRealizationDate: recurrenceRealizationDate,
                    nextDate: dayjs()
                      .add(interval, 'year')
                      .format('YYYY-MM-DD'),
                    endDate: null,
                  },
                })
              },
              {
                maxWait: 100000,
                timeout: 100000,
              },
            )
          }
        }

        return reply.status(201).send()
      },
    )
}
