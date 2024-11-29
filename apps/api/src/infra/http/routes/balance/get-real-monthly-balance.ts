import { dayjs } from '@saas/core'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { BalanceService } from '@/application/service/balance-service'

import { auth } from '../../middlewares/auth'

export async function getRealMonthlyBalance(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/real-monthly-balance',
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
          querystring: z.object({
            month: z
              .number({ coerce: true })
              .refine(
                (value) =>
                  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].includes(value),
                { message: 'Mês inválido.' },
              )
              .default(dayjs().get('month') + 1),
          }),
          response: {
            200: z.any(),
          },
        },
      },
      async (request, reply) => {
        const balanceService = new BalanceService()
        await request.getCurrentUserId()
        const { slug } = request.params
        const { organization } = await request.getUserMembership(slug)
        const { month } = request.query
        const organizationId = organization.id
        const settedMonth = dayjs().set('month', month - 1)
        const startOfMonth = settedMonth.startOf('month').format('YYYY-MM-DD')
        const endOfMonth = settedMonth.endOf('month').format('YYYY-MM-DD')

        const realMonthlyBalance = await balanceService.getRealMonthlyBalance({
          organizationId,
          startDate: startOfMonth,
          endDate: endOfMonth,
          visibledInOverallBalance: true,
        })

        const expectedMonthlyBalance =
          await balanceService.getExpectedMonthlyBalance({
            organizationId,
            startDate: startOfMonth,
            endDate: endOfMonth,
            visibledInOverallBalance: true,
          })

        const expectedRevenueOfTheMonth =
          await balanceService.getUnpaidAndPaidRevenues({
            organizationId,
            startDate: startOfMonth,
            endDate: endOfMonth,
            visibledInOverallBalance: true,
          })

        const realRevenueOfTheMonth = await balanceService.getPaidRevenues({
          organizationId,
          startDate: startOfMonth,
          endDate: endOfMonth,
          visibledInOverallBalance: true,
        })
        // const expectedExpenseOfTheMonth =

        const expectedExpenseOfTheMonth =
          await balanceService.getUnpaidAndPaidExpenses({
            organizationId,
            startDate: startOfMonth,
            endDate: endOfMonth,
            visibledInOverallBalance: true,
          })

        const paidExpenseOfTheMonth = await balanceService.getPaidExpenses({
          organizationId,
          startDate: startOfMonth,
          endDate: endOfMonth,
          visibledInOverallBalance: true,
        })

        const unpaidExpenseOfTheMonth = await balanceService.getUnpaidExpenses({
          organizationId,
          startDate: startOfMonth,
          endDate: endOfMonth,
          visibledInOverallBalance: true,
        })

        const currentBankingBalance =
          await balanceService.getCurrentBankingBalance({
            organizationId,
            visibledInOverallBalance: true,
          })
        const expectedBankingBalanceForToday =
          await balanceService.getExpectedBankingBalanceForToday({
            organizationId,
            visibledInOverallBalance: true,
          })

        return reply.send({
          realMonthlyBalance: realMonthlyBalance.getAmount() / 100,
          expectedMonthlyBalance: expectedMonthlyBalance.getAmount() / 100,
          expectedRevenueOfTheMonth:
            expectedRevenueOfTheMonth.getAmount() / 100,
          realRevenueOfTheMonth: realRevenueOfTheMonth.getAmount() / 100,
          expectedExpenseOfTheMonth:
            expectedExpenseOfTheMonth.getAmount() / 100,
          paidExpenseOfTheMonth: paidExpenseOfTheMonth.getAmount() / 100,
          unpaidExpenseOfTheMonth: unpaidExpenseOfTheMonth.getAmount() / 100,
          currentBankingBalance: currentBankingBalance.getAmount() / 100,
          expectedBankingBalanceForToday:
            expectedBankingBalanceForToday.getAmount() / 100,
          //   expectedBalanceOfTheDay: 0
        })
      },
    )
}
