import { BadRequestError, dayjs, ResourceNotFoundError } from '@saas/core'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function archiveCreditCard(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .patch(
      '/organizations/:slug/credit-cards/:id/archive',
      {
        schema: {
          tags: ['Credit Cards'],
          summary: 'Archive a credit card',
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

        if (creditCard.blockedByExpiredSubscription) {
          throw new BadRequestError(
            'pt-br.credit-card.blocked-by-expired-subscription',
          )
        }

        if (creditCard.archivedAt) {
          throw new BadRequestError(
            'pt-br.credit-card.credit-card-already-archive',
          )
        }

        await prisma.creditCard.update({
          where: {
            id,
          },
          data: {
            archivedAt: dayjs().toDate(),
          },
        })

        return reply.status(204).send()
      },
    )
}
