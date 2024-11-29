import { dayjs } from '@saas/core'
import dinero from 'dinero.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { BalanceService } from '@/application/service/balance-service'
import { CreditCardService } from '@/application/service/credit-card-service'
import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
type CashFlowData = {
  realizationDate: string
  amount: dinero.Dinero
  amountOfTransactions: number
}
export async function getCashFlowChart(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organizations/:slug/balance/cash-flow',
      {
        schema: {
          tags: ['Monthly balance'],
          summary: 'Get real monthly balance',
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
          }),
          body: z.object({
            visibledInOverallBalance: z.boolean().nullish().default(null),
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
              cashFlowData: z.array(
                z.object({
                  date: z.string(),
                  amount: z.number(),
                  amountOfTransactions: z.number(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        await request.getCurrentUserId()
        const balanceService = new BalanceService()
        const creditCardService = new CreditCardService()
        const { slug } = request.params
        const { organization } = await request.getUserMembership(slug)
        const { visibledInOverallBalance } = request.body
        const period = 15
        const startDate = dayjs().subtract(period, 'day').format('YYYY-MM-DD')
        const endDate = dayjs().add(period, 'day').format('YYYY-MM-DD')

        // pegar o saldo bancario atual na primeira data.

        // preciso recalcular

        const {
          totalTransactionsValue: totalTransactionsValueAllTime,
          totalPaymentsValue: totalPaymentsValueAllTime,
        } =
          await creditCardService.getTotalAmountOfCreditCardTransactionsAndPayments(
            {
              creditCardIds: null,
              organizationId: organization.id,
              invoiceId: null,
              startDate: null,
              endDate: dayjs(startDate).subtract(1, 'day').format('YYYY-MM-DD'),
              invoiceMonth: null,
              invoiceYear: null,
            },
          )

        const availableLimitUsedAllTime = totalTransactionsValueAllTime
          .subtract(totalPaymentsValueAllTime)
          .multiply(-1)

        const bankingBalanceOnStartDatePartial =
          await balanceService.getExpectedBankingBalanceOnASpecificDate({
            organizationId: organization.id,
            date: dayjs(startDate).subtract(1, 'day').format('YYYY-MM-DD'),
            visibledInOverallBalance,
          })

        let bankingBalanceOnStartDate = bankingBalanceOnStartDatePartial.add(
          availableLimitUsedAllTime,
        )

        const transactions = await prisma.transaction.findMany({
          where: {
            organizationId: organization.id,
            creditCardId: null,
            skip: false,
            // status: 'PAID',
            financialAccount:
              visibledInOverallBalance !== null
                ? {
                    visibledInOverallBalance,
                  }
                : undefined,
            realizationDate: {
              gte: startDate,
              lte: endDate,
            },
          },
        })

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

        // agroupar pela data

        const transactionsGroupedByDay = transactions.reduce<CashFlowData[]>(
          (acc, t) => {
            let existingDate = acc.find(
              (agg) => agg.realizationDate === t.realizationDate,
            )

            if (!existingDate) {
              existingDate = {
                realizationDate: t.realizationDate,
                amountOfTransactions: 0,
                amount: dinero({
                  amount: 0,
                  currency: 'BRL',
                }),
              }
              acc.push(existingDate)
            }

            if (existingDate) {
              existingDate.amountOfTransactions += 1
            }

            //   if(t.realizationDate === startDate) {}

            if (t.type === 'EXPENSE') {
              existingDate.amount = existingDate.amount.add(
                dinero({ amount: t.amount.toNumber(), currency: 'BRL' }),
              )
            }
            if (t.type === 'REVENUE') {
              existingDate.amount = existingDate.amount.add(
                dinero({ amount: t.amount.toNumber(), currency: 'BRL' }),
              )
            }
            // if(t.type === 'TRANSFER') {}
            if (t.type === 'NEGATIVE_ADJUSTMENT') {
              existingDate.amount = existingDate.amount.add(
                dinero({ amount: t.amount.toNumber(), currency: 'BRL' }),
              )
            }
            if (t.type === 'POSITIVE_ADJUSTMENT') {
              existingDate.amount = existingDate.amount.add(
                dinero({ amount: t.amount.toNumber(), currency: 'BRL' }),
              )
            }

            return acc
          },
          [],
        )

        const invoicesGroupedByDay = creditCardInvoices.reduce<CashFlowData[]>(
          (acc, item) => {
            let existingDate = acc.find(
              (agg) => agg.realizationDate === item.dueDate,
            )

            if (!existingDate) {
              existingDate = {
                realizationDate: item.dueDate,
                amountOfTransactions: 0,
                amount: dinero({
                  amount: 0,
                  currency: 'BRL',
                }),
              }
              acc.push(existingDate)
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

            existingDate.amount = existingDate.amount.add(
              amountToBePaidOnTheInvoice,
            )

            if (
              existingDate &&
              !transactions
                .subtract(payments)
                .equalsTo(dinero({ amount: 0, currency: 'BRL' }))
            ) {
              existingDate.amountOfTransactions += 1
            }

            return acc
          },
          [],
        )

        const combinedGroupedByMonth = [
          ...transactionsGroupedByDay,
          ...invoicesGroupedByDay,
        ].reduce<CashFlowData[]>((acc, item) => {
          // Encontra o mês já existente no array combinado
          let existingDate = acc.find(
            (agg) => agg.realizationDate === item.realizationDate,
          )

          // Se não encontrar o mês, cria um novo objeto e o adiciona ao array
          if (!existingDate) {
            existingDate = {
              amount: dinero({
                amount: 0,
                currency: 'BRL',
              }),
              amountOfTransactions: 0,
              realizationDate: item.realizationDate,
            }
            acc.push(existingDate)
          }

          // Atualiza os valores somando com os valores existentes
          existingDate.amountOfTransactions += item.amountOfTransactions
          existingDate.amount = existingDate.amount.add(item.amount)

          return acc
        }, [])

        const todayDay = dayjs()
        const dates = []
        for (let i = period; i > 0; i--) {
          const dataAnterior = todayDay.subtract(i, 'day').format('YYYY-MM-DD')
          dates.push({ date: dataAnterior })
        }

        // Adiciona a data de hoje
        dates.push({ date: todayDay.format('YYYY-MM-DD') })

        // Adiciona os 30 dias posteriores
        for (let i = 1; i <= period; i++) {
          const dataPosterior = todayDay.add(i, 'day').format('YYYY-MM-DD')
          dates.push({ date: dataPosterior })
        }

        const transactionWithMissingDates = dates.map(({ date }) => {
          const transaction = combinedGroupedByMonth.find(
            (t) => t.realizationDate === date,
          )

          if (transaction) {
            return {
              date,
              amount: transaction.amount,
              amountOfTransactions: transaction.amountOfTransactions,
            }
          }

          return {
            date,
            amount: dinero({
              amount: 0,
              currency: 'BRL',
            }),
            amountOfTransactions: 0,
          }
        })

        const cashFlowData = transactionWithMissingDates.map((item) => {
          bankingBalanceOnStartDate = bankingBalanceOnStartDate.add(item.amount)
          return {
            ...item,
            amount: bankingBalanceOnStartDate.getAmount() / 100,
          }
        })

        return reply.send({
          cashFlowData,
        })
      },
    )
}
