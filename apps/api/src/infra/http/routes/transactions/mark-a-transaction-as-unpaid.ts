import { BadRequestError, ResourceNotFoundError } from '@saas/core'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function markATransactionAsUnpaid(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .patch(
      '/organizations/:slug/transactions/:id/mark-as-unpaid',
      {
        schema: {
          tags: ['Transactions'],
          summary: 'Mark an expense transaction as unpaid',
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
            204: z.null(),
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
            type: {
              in: ['EXPENSE', 'REVENUE'],
            },
          },
        })

        if (!transaction) {
          throw new ResourceNotFoundError('pt-br.notFound.transaction')
        }

        if (transaction.status === 'UNPAID') {
          throw new BadRequestError(
            'pt-br.transactions.transaction-already-unpaid',
          )
        }

        // await prisma.transaction.update({
        //   where: {
        //     id: transaction.id,
        //   },
        //   data: {
        //     paidAt: null,
        //     status: 'UNPAID',
        //   },
        // })

        return reply.status(204).send()
      },
    )
}
