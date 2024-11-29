import { TransactionStatus } from '@prisma/client'
import { dayjs } from '@saas/core'
import dinero from 'dinero.js'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
type MonthlyAggregation = {
  month: number
  amountOfExpenses: number
  amountOfRevenues: number
  totalAmountOfExpense: dinero.Dinero
  totalAmountOfRevenue: dinero.Dinero
}

export async function monthlyRevenueExpenseChart(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .post(
      '/organizations/:slug/transactions/charts/monthly-revenue-expense',
      {
        schema: {
          tags: ['Transactions'],
          summary: 'Monthly balance',
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
          }),
          body: z.object({
            status: z.array(z.nativeEnum(TransactionStatus)),
            year: z
              .number({
                coerce: true,
                invalid_type_error: 'Ano inválido.',
              })
              .default(dayjs().year()),
            visibledInOverallBalance: z.boolean().nullish().default(null),
          }),
          response: {
            // 200: z.any(),
            200: z.object({
              transactionsByMonth: z.array(
                z.object({
                  month: z.number(),
                  amountOfExpenses: z.number(),
                  amountOfRevenues: z.number(),
                  totalAmountOfExpense: z.number(),
                  totalAmountOfRevenue: z.number(),
                  balance: z.number(),
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
        const { year, status, visibledInOverallBalance } = request.body

        const startDate = dayjs()
          .set('year', year)
          .startOf('year')
          .format('YYYY-MM-DD')
        const endDate = dayjs()
          .set('year', year)
          .endOf('year')
          .format('YYYY-MM-DD')
        const transactions = await prisma.transaction.groupBy({
          by: ['realizationDate', 'type'],
          where: {
            organizationId: organization.id,
            creditCardId: null,
            type: {
              in: ['EXPENSE', 'REVENUE'],
            },
            status: {
              in: status,
            },
            realizationDate: {
              gte: startDate,
              lte: endDate,
            },
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
          },
          _count: true,
          _sum: {
            amount: true,
          },
        })

        const groupedByMonthTransactions: MonthlyAggregation[] =
          transactions.reduce<MonthlyAggregation[]>((acc, item) => {
            const month = dayjs(item.realizationDate).month()
            // const month = new Date(item.dataProcessamento).getMonth() + 1 // Extrai o mês (1 a 12)

            // Busca o mês já existente no array
            let existingMonth = acc.find((agg) => agg.month === month)

            // Se não encontrar o mês, cria um novo objeto e o adiciona ao array
            if (!existingMonth) {
              existingMonth = {
                month,
                amountOfExpenses: 0,
                amountOfRevenues: 0,
                totalAmountOfExpense: dinero({
                  amount: 0,
                  currency: 'BRL',
                }),
                totalAmountOfRevenue: dinero({
                  amount: 0,
                  currency: 'BRL',
                }),
              }

              acc.push(existingMonth)
            }

            // Atualiza os valores do mês encontrado ou recém-adicionado

            if (item.type === 'EXPENSE') {
              existingMonth.amountOfExpenses += item._count
              existingMonth.totalAmountOfExpense =
                existingMonth.totalAmountOfExpense.add(
                  dinero({
                    amount: item._sum.amount?.toNumber() ?? 0,
                    currency: 'BRL',
                  }),
                )
            }

            if (item.type === 'REVENUE') {
              existingMonth.amountOfRevenues += item._count
              existingMonth.totalAmountOfRevenue =
                existingMonth.totalAmountOfRevenue.add(
                  dinero({
                    amount: item._sum.amount?.toNumber() ?? 0,
                    currency: 'BRL',
                  }),
                )
            }

            return acc
          }, [])

        const creditCardInvoices = await prisma.creditCardInvoice.findMany({
          where: {
            creditCard: {
              organizationId: organization.id,
            },
            dueDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            dueDate: true,
            transactions: true,
            invoicePayments: true,
          },
        })

        const groupedByMonthInvoices: MonthlyAggregation[] =
          creditCardInvoices.reduce<MonthlyAggregation[]>((acc, item) => {
            const month = dayjs(item.dueDate).month()
            let existingMonth = acc.find((agg) => agg.month === month)

            if (!existingMonth) {
              existingMonth = {
                month,
                amountOfExpenses: 0,
                amountOfRevenues: 0,
                totalAmountOfExpense: dinero({
                  amount: 0,
                  currency: 'BRL',
                }),
                totalAmountOfRevenue: dinero({
                  amount: 0,
                  currency: 'BRL',
                }),
              }

              acc.push(existingMonth)
            }

            const t = item.transactions.reduce((sum, item) => {
              return sum + item.amount.toNumber() * -1
            }, 0)
            const transactions = dinero({ amount: t, currency: 'BRL' })
            const p = item.invoicePayments.reduce((sum, item) => {
              return sum + item.amount.toNumber() * -1
            }, 0)
            const payments = dinero({ amount: p, currency: 'BRL' })

            const amountToBePaidOnTheInvoice = transactions
              .subtract(payments)
              .multiply(-1)

            existingMonth.totalAmountOfExpense =
              existingMonth.totalAmountOfExpense.add(amountToBePaidOnTheInvoice)
            // existingMonth.amountOfExpenses += 1

            if (
              existingMonth &&
              !transactions
                .subtract(payments)
                .equalsTo(dinero({ amount: 0, currency: 'BRL' }))
            ) {
              existingMonth.amountOfExpenses += 1
            }

            return acc
          }, [])

        const combinedGroupedByMonth: MonthlyAggregation[] = [
          ...groupedByMonthTransactions,
          ...groupedByMonthInvoices,
        ].reduce<MonthlyAggregation[]>((acc, item) => {
          // Encontra o mês já existente no array combinado
          let existingMonth = acc.find((agg) => agg.month === item.month)

          // Se não encontrar o mês, cria um novo objeto e o adiciona ao array
          if (!existingMonth) {
            existingMonth = {
              month: item.month,
              amountOfExpenses: 0,
              amountOfRevenues: 0,
              totalAmountOfExpense: dinero({
                amount: 0,
                currency: 'BRL',
              }),
              totalAmountOfRevenue: dinero({
                amount: 0,
                currency: 'BRL',
              }),
            }
            acc.push(existingMonth)
          }

          // Atualiza os valores somando com os valores existentes
          existingMonth.amountOfExpenses += item.amountOfExpenses
          existingMonth.amountOfRevenues += item.amountOfRevenues
          existingMonth.totalAmountOfExpense =
            existingMonth.totalAmountOfExpense.add(item.totalAmountOfExpense)
          existingMonth.totalAmountOfRevenue =
            existingMonth.totalAmountOfRevenue.add(item.totalAmountOfRevenue)

          return acc
        }, [])

        const months = Array.from({ length: 12 }, (_, i) => i)
        const chartDataGroupedByMonth = months.map((m) => {
          const chartDataInTheMonth = combinedGroupedByMonth.find(
            ({ month }) => month === m,
          )
          // const d = dayjs().set('month', m - 1)
          // const shortMonth = d.format('MMM')
          // const shortMonthFormatted = shortMonth
          //   .substring(0, 1)
          //   .toUpperCase()
          //   .concat(shortMonth.substring(1))

          // const completeMonth = d.format('MMMM')
          // const completeMonthFormatted = completeMonth
          //   .substring(0, 1)
          //   .toUpperCase()
          //   .concat(completeMonth.substring(1))
          // const completeDateFormatted = `${completeMonthFormatted} de ${d.get(
          //   'year',
          // )}`

          if (chartDataInTheMonth) {
            return {
              month: m,
              // shortNameOfMonth: shortMonthFormatted,
              // nomeMesAno: completeDateFormatted,
              amountOfExpenses: chartDataInTheMonth.amountOfExpenses,
              amountOfRevenues: chartDataInTheMonth.amountOfRevenues,
              totalAmountOfExpense:
                (chartDataInTheMonth.totalAmountOfExpense.getAmount() / 100) *
                -1,
              totalAmountOfRevenue:
                chartDataInTheMonth.totalAmountOfRevenue.getAmount() / 100,
              balance:
                chartDataInTheMonth.totalAmountOfRevenue
                  .add(chartDataInTheMonth.totalAmountOfExpense)
                  .getAmount() / 100,
            }
          }
          return {
            month: m,
            // shortNameOfMonth: shortMonthFormatted,
            // nomeMesAno: completeDateFormatted,
            amountOfExpenses: 0,
            amountOfRevenues: 0,
            totalAmountOfExpense: 0,
            totalAmountOfRevenue: 0,
            balance: 0,
          }
        })

        return reply.status(200).send({
          transactionsByMonth: chartDataGroupedByMonth,
        })
      },
    )
}
