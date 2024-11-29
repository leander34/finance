import { BankAccountType, type Prisma } from '@prisma/client'
import { dayjs } from '@saas/core'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BalanceService } from '@/application/service/balance-service'
import { SubscriptionEffectsService } from '@/application/service/subscription-effects'
import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function block(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .get(
      '/organizations/:slug/financial-accounts/block',
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

          response: {
            200: z.any(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const balanceService = new BalanceService()

        const { slug } = request.params
        const { organization } = await request.getUserMembership(slug)

        const subscriptionEffectsService = new SubscriptionEffectsService()

        await subscriptionEffectsService.unblockAllEntityWhenSubscriptionUpdatesToPremium(
          organization.id,
        )

        return reply.status(200).send()
      },
    )
}
