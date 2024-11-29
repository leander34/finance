import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function fetchFinancialAccounts(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .post(
      '/organizations/:slug/financial-accounts/list',
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
            includeWallet: z.boolean().optional(),
          }),
          response: {
            200: z.object({
              financialAccounts: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  color: z.string(),
                  bank: z.object({
                    id: z.string().uuid(),
                    name: z.string(),
                    imageUrl: z.string().url(),
                  }),
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
        const { includeWallet } = request.body

        const financialAccounts = await prisma.financialAccount.findMany({
          where: {
            organizationId: organization.id,
            blockedByExpiredSubscription: false,
            isWallet: includeWallet === true ? undefined : false,
          },
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            id: true,
            color: true,
            name: true,
            bank: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        })

        return reply.status(200).send({
          financialAccounts,
        })
      },
    )
}
