import { dayjs } from '@saas/core'
import { CronJob } from 'cron'

import { prisma } from '@/infra/database/prisma'
import { calcNextRecurrenceDate } from '@/utils/calc-next-recurrence-date'
import { generateInvoice } from '@/utils/generate-invoice'
import { getAmountRecurrenceRepetition } from '@/utils/get-amount-recurrence-repetition'
const job = new CronJob(
  '0 17 18 * * *', // cronTime
  async function () {
    console.log('recurrence cron')
    const recurrences = await prisma.recurrence.findMany({
      where: {
        isActive: true,
        nextDate: dayjs('2024-11-09').format('YYYY-MM-DD'),
        OR: [
          {
            endDate: {
              lte: dayjs().format('YYYY-MM-DD'),
            },
          },
          {
            endDate: {
              equals: null,
            },
          },
        ],
      },
      include: {
        tags: true,
      },
    })
    console.log(recurrences)

    for (const recurrence of recurrences) {
      const creditCardId = recurrence.creditCardId
      if (
        recurrence.financialAccountId &&
        !recurrence.destinationFinancialAccountId
      ) {
        // recurrence normal
        await prisma.$transaction(async (tx) => {
          const { recurrenceRepetition, interval } =
            getAmountRecurrenceRepetition(
              recurrence.frequency,
              recurrence.lastRealizationDate,
            )
          let recurrenceRealizationDate = calcNextRecurrenceDate(
            recurrence.lastRealizationDate,
            recurrence.frequency,
            recurrence.day,
          )

          for (let i = 0; i < recurrenceRepetition; i++) {
            await tx.transaction.create({
              data: {
                userId: recurrence.userId,
                organizationId: recurrence.organizationId,
                financialAccountId: recurrence.financialAccountId,
                recurrenceId: recurrence.id,
                type: recurrence.type,
                amount: recurrence.amount,
                status: 'UNPAID',
                realizationDate: recurrenceRealizationDate,
                degreeOfNeed: recurrence.degreeOfNeed,
                skip: recurrence.skip,
                description: recurrence.description,
                categoryId: recurrence.categoryId,
                observation: recurrence.observation,
                transactionsTags: recurrence.tags
                  ? {
                      createMany: {
                        data: recurrence.tags.map((tag) => ({ tagId: tag.id })),
                      },
                    }
                  : undefined,
              },
            })

            console.log('re', recurrenceRealizationDate)
            console.log('i', i)

            if (i + 1 !== recurrenceRepetition) {
              recurrenceRealizationDate = calcNextRecurrenceDate(
                recurrenceRealizationDate,
                recurrence.frequency,
                recurrence.day,
              )
            }
          }

          console.log('re2', recurrenceRealizationDate)

          await tx.recurrence.update({
            where: {
              id: recurrence.id,
            },
            data: {
              lastRealizationDate: recurrenceRealizationDate,
              nextDate: dayjs().add(interval, 'year').format('YYYY-MM-DD'),
              lastProcessingDate: dayjs().format('YYYY-MM-DD'),
            },
          })
        })
      }

      if (
        recurrence.financialAccountId &&
        recurrence.destinationFinancialAccountId &&
        recurrence.type === 'TRANSFER'
      ) {
        await prisma.$transaction(async (tx) => {
          const { recurrenceRepetition, interval } =
            getAmountRecurrenceRepetition(
              recurrence.frequency,
              recurrence.lastRealizationDate,
            )
          let recurrenceRealizationDate = calcNextRecurrenceDate(
            recurrence.lastRealizationDate,
            recurrence.frequency,
            recurrence.day,
          )

          for (let i = 0; i < recurrenceRepetition; i++) {
            await tx.transaction.create({
              data: {
                recurrenceId: recurrence.id,
                userId: recurrence.userId,
                organizationId: recurrence.organizationId,
                financialAccountId: recurrence.financialAccountId,
                destinationFinancialAccountId:
                  recurrence.destinationFinancialAccountId,
                type: recurrence.type,
                amount: recurrence.amount,
                status: 'UNPAID',
                realizationDate: recurrenceRealizationDate,
                degreeOfNeed: recurrence.degreeOfNeed,
                skip: recurrence.skip,
                description: recurrence.description,
                categoryId: recurrence.categoryId,
                observation: recurrence.observation,
                transactionsTags: recurrence.tags
                  ? {
                      createMany: {
                        data: recurrence.tags.map((tag) => ({ tagId: tag.id })),
                      },
                    }
                  : undefined,
              },
            })

            console.log('re', recurrenceRealizationDate)
            console.log('i', i)

            if (i + 1 !== recurrenceRepetition) {
              recurrenceRealizationDate = calcNextRecurrenceDate(
                recurrenceRealizationDate,
                recurrence.frequency,
                recurrence.day,
              )
            }
          }

          console.log('re2', recurrenceRealizationDate)

          await tx.recurrence.update({
            where: {
              id: recurrence.id,
            },
            data: {
              lastRealizationDate: recurrenceRealizationDate,
              nextDate: dayjs().add(interval, 'year').format('YYYY-MM-DD'),
              lastProcessingDate: dayjs().format('YYYY-MM-DD'),
            },
          })
        })
      }

      if (creditCardId) {
        await prisma.$transaction(async (tx) => {
          const { recurrenceRepetition, interval } =
            getAmountRecurrenceRepetition(
              recurrence.frequency,
              recurrence.lastRealizationDate,
            )
          let recurrenceRealizationDate = calcNextRecurrenceDate(
            recurrence.lastRealizationDate,
            recurrence.frequency,
            recurrence.day,
          )

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
                  organizationId: recurrence.organizationId,
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
                userId: recurrence.userId,
                organizationId: recurrence.organizationId,
                creditCardId,
                creditCardInvoiceId: invoice.id,
                recurrenceId: recurrence.id,
                type: recurrence.type,
                amount: recurrence.amount,
                status: 'UNPAID',
                realizationDate: recurrenceRealizationDate,
                degreeOfNeed: recurrence.degreeOfNeed,
                skip: recurrence.skip,
                description: recurrence.description,
                categoryId: recurrence.categoryId,
                observation: recurrence.observation,
                futureTransaction: true,
                transactionsTags: recurrence.tags
                  ? {
                      createMany: {
                        data: recurrence.tags.map((tag) => ({ tagId: tag.id })),
                      },
                    }
                  : undefined,
              },
            })

            if (i + 1 !== recurrenceRepetition) {
              recurrenceRealizationDate = calcNextRecurrenceDate(
                recurrenceRealizationDate,
                recurrence.frequency,
                recurrence.day,
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
              lastProcessingDate: dayjs().format('YYYY-MM-DD'),
            },
          })
        })
      }
    }
  }, // onTick
  null, // onComplete
  true, // start
  'America/Sao_Paulo', // timeZone
)

export default job
