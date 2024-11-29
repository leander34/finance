import { BadRequestError, dayjs, ResourceNotFoundError } from '@saas/core'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function archiveFinancialAccount(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .patch(
      '/organizations/:slug/financial-accounts/:id/archive',
      {
        schema: {
          tags: ['Financial Accounts'],
          summary: 'Archive a financial account',
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
            id: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        await request.getCurrentUserId()
        const { slug, id } = request.params
        const { organization } = await request.getUserMembership(slug)

        const financialAccount = await prisma.financialAccount.findFirst({
          where: {
            AND: [
              {
                organizationId: organization.id,
              },
              {
                id,
              },
            ],
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

        if (financialAccount.archivedAt) {
          throw new BadRequestError(
            'pt-br.financial-account.account-already-archive',
          )
        }

        await prisma.financialAccount.update({
          where: {
            id: financialAccount.id,
          },
          data: {
            archivedAt: dayjs().toDate(),
          },
        })

        return reply.status(204).send()
      },
    )
}
