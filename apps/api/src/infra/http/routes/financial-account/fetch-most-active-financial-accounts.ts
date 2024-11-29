import { dayjs } from '@saas/core'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BalanceService } from '@/application/service/balance-service'
import { CreditCardService } from '@/application/service/credit-card-service'
import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function fetchMostActiveFinancialAccounts(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .get(
      '/organizations/:slug/most-active-accounts',
      {
        schema: {
          tags: ['Financial Accounts'],
          summary: 'Fetch most active financial accounts',
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            204: z.object({
              amountOfFinancialAccounts: z.number(),
              financialAccounts: z.array(
                z.object({
                  id: z.string().uuid(),
                  organizationId: z.string().uuid(),
                  name: z.string(),
                  color: z.string(),
                  expectedExpensesValue: z.number(),
                  expectedRevenuesValue: z.number(),
                  expectedMonthlyBalance: z.number(),
                  currentBalance: z.number(),
                  visibledInOverallBalance: z.boolean(),
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

        const financialAccountsPrisma = await prisma.financialAccount.findMany({
          where: {
            organizationId: organization.id,
          },
          select: {
            id: true,
            organizationId: true,
            color: true,
            name: true,
            visibledInOverallBalance: true,
          },
          take: 5,
        })

        const financialAccountsPromisse = financialAccountsPrisma.map(
          async (financialAccount) => {
            const { totalTransactionsValue, totalPaymentsValue } =
              await creditCardService.getTotalAmountOfCreditCardTransactionsAndPayments(
                {
                  creditCardIds: null,
                  organizationId: organization.id,
                  invoiceId: null,
                  startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
                  endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
                  invoiceMonth: null,
                  invoiceYear: null,
                },
              )
            const availableLimitUsed = totalTransactionsValue
              .subtract(totalPaymentsValue)
              .multiply(-1)

            const expectedRevenuesValue =
              await balanceService.getUnpaidAndPaidRevenues({
                financialAccountId: financialAccount.id,
                organizationId: financialAccount.organizationId,
                startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
                endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
                visibledInOverallBalance: null,
              })
            const expectedExpensesValuePartial =
              await balanceService.getUnpaidAndPaidExpenses({
                financialAccountId: financialAccount.id,
                organizationId: financialAccount.organizationId,
                startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
                endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
                visibledInOverallBalance: null,
              })

            const expectedExpensesValue =
              expectedExpensesValuePartial.add(availableLimitUsed)

            const expectedMonthlyBalancePartial = expectedRevenuesValue.add(
              expectedExpensesValue,
            )

            const expectedMonthlyBalance =
              expectedMonthlyBalancePartial.add(availableLimitUsed)

            const currentBalance =
              await balanceService.getCurrentBankingBalance({
                organizationId: organization.id,
                financialAccountId: financialAccount.id,
                visibledInOverallBalance: null,
              })

            return {
              ...financialAccount,
              expectedExpensesValue: expectedExpensesValue.getAmount() / 100,
              expectedRevenuesValue: expectedRevenuesValue.getAmount() / 100,
              expectedMonthlyBalance: expectedMonthlyBalance.getAmount() / 100,
              currentBalance: currentBalance.getAmount() / 100,
            }
          },
        )

        const financialAccounts = await Promise.all(financialAccountsPromisse)

        const amountOfFinancialAccounts = await prisma.financialAccount.count({
          where: {
            organizationId: organization.id,
          },
        })

        return reply.status(200).send({
          amountOfFinancialAccounts,
          financialAccounts,
        })
      },
    )
}
