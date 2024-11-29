import { ResourceNotFoundError } from '@saas/core'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function deleteCreditCard(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .delete(
      '/organizations/:slug/credit-cards/:id',
      {
        schema: {
          tags: ['Credit Cards'],
          summary: 'Delete a credit card',
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

        const creditCard = await prisma.creditCard.findFirst({
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

        if (!creditCard) {
          throw new ResourceNotFoundError('pt-br.notFound.credit-card')
        }

        await prisma.creditCard.delete({
          where: {
            id: creditCard.id,
          },
        })

        return reply.status(204).send()
      },
    )
}
