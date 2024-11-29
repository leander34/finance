import { dayjs } from '@saas/core'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BalanceService } from '@/application/service/balance-service'
import { CreditCardService } from '@/application/service/credit-card-service'
import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function fetchOverviewFinancialAccounts(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .get(
      '/organizations/:slug/overview-accounts',
      {
        schema: {
          tags: ['Financial Accounts'],
          summary: 'Fetch overview accounts.',
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
              amountOfFinancialAccounts: z.number(),
              financialAccounts: z.array(
                z.object({
                  id: z.string().uuid(),
                  organizationId: z.string().uuid(),
                  name: z.string(),
                  color: z.string(),
                  imageUrl: z.string().url(),
                  currentBalance: z.number(),
                  expectedMonthlyBalance: z.number(),
                  expectedRevenuesValue: z.number(),
                  expectedExpensesValue: z.number(),
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
            visibledInOverallBalance: true,
          },
          select: {
            id: true,
            organizationId: true,
            color: true,
            name: true,
            visibledInOverallBalance: true,
            bank: {
              select: {
                imageUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
          take: 5,
        })

        const financialAccountsPromisse = financialAccountsPrisma.map(
          async ({ bank, ...financialAccount }) => {
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
              await balanceService.getExpectedRevenues({
                financialAccountId: financialAccount.id,
                organizationId: financialAccount.organizationId,
                startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
                endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
                visibledInOverallBalance: true,
              })
            const expectedExpensesValuePartial =
              await balanceService.getExpectedExpenses({
                financialAccountId: financialAccount.id,
                organizationId: financialAccount.organizationId,
                startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
                endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
                visibledInOverallBalance: true,
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
                visibledInOverallBalance: true,
              })

            return {
              ...financialAccount,
              imageUrl: bank.imageUrl,
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
            visibledInOverallBalance: true,
          },
        })

        return reply.status(200).send({
          amountOfFinancialAccounts,
          financialAccounts,
        })
      },
    )
}
