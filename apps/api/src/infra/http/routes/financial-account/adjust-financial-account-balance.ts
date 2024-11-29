import {
  BadRequestError,
  dayjs,
  getCurrentActivePlan,
  type RESOLVED_PLAN_NAMES,
  ResourceNotFoundError,
} from '@saas/core'
import dinero from 'dinero.js'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BalanceService } from '@/application/service/balance-service'
import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function adjustFinancialAccountBalance(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .post(
      '/organizations/:slug/financial-accounts/:id/adjust-balance',
      {
        schema: {
          tags: ['Financial Accounts'],
          summary: 'Adjust financial account balance',
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
            id: z.string().uuid({ message: 'Id inválido.' }),
          }),
          body: z.object({
            type: z.union(
              [
                z.literal('ADJUSTMENT_TRANSACTION'),
                z.literal('CHANGE_INITIAL_BALANCE'),
              ],
              { required_error: 'Tipo do reajuste é obrigatório.' },
            ),
            adjustTo: z.coerce.number({ required_error: 'Valor inválido.' }),
            description: z.string().nullable(),
          }),
          response: {
            201: z.null(),
          },
        },
      },
      async (request, reply) => {
        const balanceService = new BalanceService()
        const userId = await request.getCurrentUserId()
        const { slug, id } = request.params
        const { organization } = await request.getUserMembership(slug)
        const { adjustTo: value, description, type } = request.body

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

        const adjustTo = dinero({
          amount: value * 100,
          currency: 'BRL',
        })

        // if(operationType === 'ADJUSTMENT_TRANSACTION') {}

        const totalTransactionCreatedToday = await prisma.transaction.count({
          where: {
            organizationId: organization.id,
            type: {
              in: ['POSITIVE_ADJUSTMENT', 'NEGATIVE_ADJUSTMENT'],
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

        const financialAccount = await prisma.financialAccount.findUnique({
          where: {
            id,
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

        if (type === 'CHANGE_INITIAL_BALANCE') {
          /// 5000
          /// curre

          const currentBalanceWithoutInitialBalance =
            await balanceService.getCurrentBankingBalanceWihtoutInitialBalance({
              visibledInOverallBalance: null,
              organizationId: organization.id,
              financialAccountId: id,
            })

          const newInititalValue = adjustTo.subtract(
            currentBalanceWithoutInitialBalance,
          )

          await prisma.financialAccount.update({
            where: {
              id,
            },
            data: {
              initialBalance: newInititalValue.getAmount(),
            },
          })
        }

        if (type === 'ADJUSTMENT_TRANSACTION') {
          const currentBalance = await balanceService.getCurrentBankingBalance({
            organizationId: organization.id,
            financialAccountId: id,
            visibledInOverallBalance: null,
          })

          if (currentBalance.equalsTo(adjustTo)) {
            throw new BadRequestError(
              'pt-br.financial-account.invalid-adjustment-balance',
            )
          }

          const transactionValue = adjustTo.subtract(currentBalance)

          const otherEarningsCategory = await prisma.category.findFirst({
            where: {
              organizationId: organization.id,
              mainCategory: true,
              name: 'Outros (ganhos)',
            },
            select: {
              id: true,
            },
          })

          const otherExpensesCategory = await prisma.category.findFirst({
            where: {
              organizationId: organization.id,
              mainCategory: true,
              name: 'Outros (gastos)',
            },
            select: {
              id: true,
            },
          })

          await prisma.transaction.create({
            data: {
              financialAccountId: id,
              userId,
              organizationId: organization.id,
              amount: transactionValue.getAmount(),
              realizationDate: dayjs().format('YYYY-MM-DD'),
              status: 'PAID',
              type:
                transactionValue.getAmount() > 0
                  ? 'POSITIVE_ADJUSTMENT'
                  : 'NEGATIVE_ADJUSTMENT',
              currency: 'BRL',
              description: description || 'Reajuste de saldo',
              // paidAt: dayjs().toDate(),
              skip: false,
              categoryId:
                transactionValue.getAmount() > 0
                  ? otherEarningsCategory!.id
                  : otherExpensesCategory!.id,
            },
          })
        }

        return reply.status(201).send()
      },
    )
}
