import { UnauthorizedError } from '@saas/core'
import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'

import { prisma } from '@/infra/database/prisma'

export const auth = fastifyPlugin(async function (app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>()
        return sub
      } catch (error) {
        throw new UnauthorizedError('pt-br.unathorized.invalid-auth-token')
      }
    }

    request.getUserMembership = async (slug: string) => {
      const userId = await request.getCurrentUserId()
      const member = await prisma.member.findFirst({
        where: {
          AND: [
            {
              userId,
            },
            {
              organization: {
                slug,
              },
            },
          ],
        },
        include: {
          organization: true,
        },
      })

      if (!member) {
        throw new UnauthorizedError(
          'pt-br.unathorized.not-member-of-this-organization',
        )
      }

      const { organization, ...membership } = member
      return {
        organization,
        membership,
      }
    }
  })
})
