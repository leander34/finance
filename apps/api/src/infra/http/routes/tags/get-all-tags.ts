import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'

export async function getAllTags(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .get(
      '/organizations/:slug/tags',
      {
        schema: {
          tags: ['Tags'],
          summary: 'Get expense tags from a organization.',
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              tags: z.array(
                z.object({
                  id: z.string().uuid().nullable(),
                  name: z.string(),
                  color: z.string(),
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

        const tags = await prisma.tag.findMany({
          where: {
            organizationId: organization.id,
            // blockedByExpiredSubscription: false,
            archivedAt: null,
            blockedByExpiredSubscription: false,
          },
          select: {
            id: true,
            name: true,
            color: true,
          },
          orderBy: {
            name: 'asc',
          },
        })

        return reply.status(200).send({
          tags,
        })
      },
    )
}
