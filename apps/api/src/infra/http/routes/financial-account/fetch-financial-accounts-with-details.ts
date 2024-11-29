import { BankAccountType, type Prisma } from '@prisma/client'
import { dayjs } from '@saas/core'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BalanceService } from '@/application/service/balance-service'
import { CreditCardService } from '@/application/service/credit-card-service'
import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function fetchFinancialAccountsWithDetails(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .post(
      '/organizations/:slug/financial-accounts/details',
      {
        schema: {
          tags: ['Financial Accounts'],
          summary: 'Fetch financial accounts from a organization',
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
              amountOfFinancialAccounts: z.number(),
              amountOfPages: z.number(),
              financialAccounts: z.array(
                z.object({
                  id: z.string().uuid(),
                  organizationId: z.string().uuid(),
                  name: z.string(),
                  color: z.string(),
                  amountOfCreditCards: z.number(),
                  amountOfTransactions: z.number(),
                  accountType: z.nativeEnum(BankAccountType),
                  bank: z.object({
                    id: z.string().uuid(),
                    name: z.string(),
                    imageUrl: z.string().url(),
                  }),
                  archivedAt: z.date().nullable(),
                  blockedByExpiredSubscription: z.boolean(),
                  description: z.string().nullable(),
                  createdAt: z.date(),
                  initialBalance: z.number(),
                  user: z.object({
                    id: z.string().uuid(),
                    name: z.string(),
                    email: z.string(),
                  }),
                  visibledInOverallBalance: z.boolean(),
                  expectedExpensesValue: z.number(),
                  expectedRevenuesValue: z.number(),
                  expectedMonthlyBalance: z.number(),
                  currentBankBalance: z.number(),
                  expectedBankBalanceAtTheEndOftheMonth: z.number(),
                  bankBalanceAtTheEndOfTheMonth: z.number(),
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
        const { month, year } = request.body
        const settedMonth = dayjs()
          .set('year', year)
          .set('month', month - 1)

        const startOfMonth = settedMonth.startOf('month').format('YYYY-MM-DD')
        const endOfMonth = settedMonth.endOf('month').format('YYYY-MM-DD')
        const where: Prisma.FinancialAccountWhereInput = {
          organizationId: organization.id,
        }

        const financialAccountsPrisma = await prisma.financialAccount.findMany({
          where,
          // take: 10,
          // skip: (page - 1) * 10,
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            id: true,
            organizationId: true,
            _count: true,
            color: true,
            name: true,
            accountType: true,
            bank: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
            archivedAt: true,
            blockedByExpiredSubscription: true,
            description: true,
            createdAt: true,
            initialBalance: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            visibledInOverallBalance: true,
          },
        })

        const financialAccountsPromisse = financialAccountsPrisma.map(
          async ({ _count, initialBalance, ...financialAccount }) => {
            const creditCardIds = (
              await prisma.creditCard.findMany({
                where: {
                  defaultPaymentAccountId: financialAccount.id,
                },
                select: {
                  id: true,
                },
              })
            ).map((creditCardId) => creditCardId.id)

            const {
              totalTransactionsValue: totalTransactionsValueAllTime,
              totalPaymentsValue: totalPaymentsValueAllTime,
            } =
              await creditCardService.getTotalAmountOfCreditCardTransactionsAndPayments(
                {
                  creditCardIds,
                  organizationId: organization.id,
                  invoiceId: null,
                  startDate: null,
                  endDate: endOfMonth,
                  invoiceMonth: null,
                  invoiceYear: null,
                },
              )

            const availableLimitUsedAllTime = totalTransactionsValueAllTime
              .subtract(totalPaymentsValueAllTime)
              .multiply(-1)

            const { totalTransactionsValue, totalPaymentsValue } =
              await creditCardService.getTotalAmountOfCreditCardTransactionsAndPayments(
                {
                  creditCardIds,
                  organizationId: organization.id,
                  invoiceId: null,
                  startDate: startOfMonth,
                  endDate: endOfMonth,
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
                startDate: settedMonth.startOf('month').format('YYYY-MM-DD'),
                endDate: settedMonth.endOf('month').format('YYYY-MM-DD'),
                visibledInOverallBalance: null,
              })
            const expectedExpensesValuePartial =
              await balanceService.getExpectedExpenses({
                financialAccountId: financialAccount.id,
                organizationId: financialAccount.organizationId,
                startDate: settedMonth.startOf('month').format('YYYY-MM-DD'),
                endDate: settedMonth.endOf('month').format('YYYY-MM-DD'),
                visibledInOverallBalance: null,
              })

            const expectedExpensesValue =
              expectedExpensesValuePartial.add(availableLimitUsed)

            const expectedMonthlyBalancePartial = expectedRevenuesValue.add(
              expectedExpensesValue,
            )

            const expectedMonthlyBalance =
              expectedMonthlyBalancePartial.add(availableLimitUsed)

            const currentBankBalance =
              await balanceService.getCurrentBankingBalance({
                organizationId: organization.id,
                financialAccountId: financialAccount.id,
                visibledInOverallBalance: null,
              })

            const expectedBankBalanceAtTheEndOftheMonthPartial =
              await balanceService.getExpectedBankingBalanceOnASpecificDate({
                organizationId: organization.id,
                financialAccountId: financialAccount.id,
                date: settedMonth.endOf('month').format('YYYY-MM-DD'),
                visibledInOverallBalance: null,
              })

            const expectedBankBalanceAtTheEndOftheMonth =
              expectedBankBalanceAtTheEndOftheMonthPartial.add(
                availableLimitUsedAllTime,
              )

            const bankBalanceAtTheEndOfTheMonth =
              await balanceService.getFinalBankBalanceOfAMonth({
                organizationId: organization.id,
                financialAccountId: financialAccount.id,
                endDate: settedMonth.endOf('month').format('YYYY-MM-DD'),
                visibledInOverallBalance: null,
              })

            return {
              ...financialAccount,
              initialBalance: initialBalance.toNumber() / 100,
              amountOfCreditCards: _count.creditCards,
              amountOfTransactions: _count.transactions,
              expectedExpensesValue: expectedExpensesValue.getAmount() / 100,
              expectedRevenuesValue: expectedRevenuesValue.getAmount() / 100,
              expectedMonthlyBalance: expectedMonthlyBalance.getAmount() / 100,
              currentBankBalance: currentBankBalance.getAmount() / 100,
              expectedBankBalanceAtTheEndOftheMonth:
                expectedBankBalanceAtTheEndOftheMonth.getAmount() / 100,
              bankBalanceAtTheEndOfTheMonth:
                bankBalanceAtTheEndOfTheMonth.getAmount() / 100,
            }
          },
        )

        const financialAccounts = await Promise.all(financialAccountsPromisse)

        const amountOfFinancialAccounts = await prisma.financialAccount.count({
          where,
        })

        return reply.status(200).send({
          amountOfFinancialAccounts,
          amountOfPages: Math.ceil(amountOfFinancialAccounts / 10),
          financialAccounts,
        })
      },
    )
}
