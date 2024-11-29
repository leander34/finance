import { BadRequestError, ResourceNotFoundError } from '@saas/core'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function editFinancialAccountVisibility(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .put(
      '/organizations/:slug/financial-accounts/:id/visibility',
      {
        schema: {
          tags: ['Financial Accounts'],
          summary: 'Edit financial account visibily',
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
            id: z.string().uuid(),
          }),
          body: z.object({
            visibledInOverallBalance: z.coerce.boolean().default(true),
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
        const { visibledInOverallBalance } = request.body
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

        await prisma.financialAccount.update({
          where: {
            id: financialAccount.id,
          },
          data: {
            visibledInOverallBalance,
          },
        })

        return reply.status(204).send()
      },
    )
}
