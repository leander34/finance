import { OrganizationType, Role } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'

export async function getOrgnizations(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations',
      {
        schema: {
          summary: 'Get organizations where user is a member',
          tags: ['Organizations'],
          security: [
            {
              bearerAuth: [],
            },
          ],
          response: {
            200: z.object({
              organizations: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  slug: z.string(),
                  avatarUrl: z.string().url().nullable(),
                  role: z.nativeEnum(Role),
                  type: z.nativeEnum(OrganizationType),
                }),
              ),
            }),
          },
        },
      },
      async (request) => {
        const userId = await request.getCurrentUserId()
        const organizations = await prisma.organization.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
            type: true,
            members: {
              select: {
                role: true,
              },
              where: {
                userId,
              },
            },
          },
          where: {
            members: {
              some: {
                userId,
              },
            },
          },
        })

        const organizationsWithUserRole = organizations.map(
          ({ members, ...organization }) => ({
            ...organization,
            role: members[0].role,
          }),
        )

        return {
          organizations: organizationsWithUserRole,
        }
      },
    )
}
