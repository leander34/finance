import { OrganizationType } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '../../middlewares/auth'

export async function getOrgnization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug',
      {
        schema: {
          summary: 'Get details from organization',
          tags: ['Organizations'],
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
              organization: z.object({
                id: z.string().uuid(),
                name: z.string(),
                slug: z.string(),
                avatarUrl: z.string().url().nullable(),
                type: z.nativeEnum(OrganizationType),
                ownerId: z.string().uuid(),
                createdAt: z.date(),
                updatedAt: z.date(),
                deletedAt: z.date().nullable(),
              }),
            }),
          },
        },
      },
      async (request) => {
        const { slug } = request.params
        const { organization } = await request.getUserMembership(slug)
        return {
          organization,
        }
      },
    )
}
