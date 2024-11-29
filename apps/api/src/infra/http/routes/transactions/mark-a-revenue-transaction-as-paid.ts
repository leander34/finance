import { BadRequestError, dayjs, ResourceNotFoundError } from '@saas/core'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function markARevenueTransactionAsPaid(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .patch(
      '/organizations/:slug/transactions/:id/revenue/pay',
      {
        schema: {
          tags: ['Transactions'],
          summary: 'Mark an revenue transaction as paid',
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
            type: 'REVENUE',
          },
        })

        if (!transaction) {
          throw new ResourceNotFoundError('pt-br.notFound.transaction')
        }

        if (transaction.status === 'PAID') {
          throw new BadRequestError(
            'pt-br.transactions.transaction-already-paid',
          )
        }

        // await prisma.transaction.update({
        //   where: {
        //     id: transaction.id,
        //   },
        //   data: {
        //     paidAt: dayjs().toDate(),
        //     status: 'PAID',
        //   },
        // })

        return reply.status(204).send()
      },
    )
}
