import { ResourceNotFoundError } from '@saas/core'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function deleteTransaction(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .delete(
      '/organizations/:slug/transactions/:id',
      {
        schema: {
          tags: ['Transactions'],
          summary: 'Edit a transaction',
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
            id: z.string().uuid({ message: 'Id inválido.' }),
          }),
          response: {
            201: z.null(),
          },
        },
      },
      async (request, reply) => {
        await request.getCurrentUserId()
        const { slug, id } = request.params
        const { organization } = await request.getUserMembership(slug)

        const transaction = await prisma.transaction.findUnique({
          where: {
            id,
            organizationId: organization.id,
          },
        })

        if (!transaction) {
          throw new ResourceNotFoundError('pt-br.notFound.transaction')
        }

        await prisma.transaction.delete({
          where: {
            id: transaction.id,
          },
        })

        return reply.status(201).send()
      },
    )
}
