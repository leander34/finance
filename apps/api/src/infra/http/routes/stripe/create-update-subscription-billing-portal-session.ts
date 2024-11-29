import { ResourceNotFoundError } from '@saas/core'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'

export async function createUpdateSubscritionBillingPortalSession(
  app: FastifyInstance,
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/stripe/sessions/billing-portal/update-subscrition',
      {
        schema: {
          summary: 'Update user subscription by stripe billing portal.',
          tags: ['Stripe'],
          security: [
            {
              bearerAuth: [],
            },
          ],
          response: {
            201: z.object({
              url: z.string().url(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            document: true,
            createdAt: true,
            subscription: {
              select: {
                stripePriceId: true,
                stripeSubscriptionId: true,
              },
            },
          },
        })

        if (!user) {
          throw new ResourceNotFoundError('pt-br.notFound.user')
        }
        return reply.status(201).send({
          url: '',
        })
      },
    )
}
