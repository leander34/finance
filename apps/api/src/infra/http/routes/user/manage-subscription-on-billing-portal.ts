import { BadRequestError, ResourceNotFoundError } from '@saas/core'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { manageSubscriptionBillingPortalSession } from '@/application/stripe'
import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'

export async function manageSubscritionOnBillingPortal(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/users/billing-portal/manage-subscrition',
      {
        schema: {
          summary: 'Manage user subscription by stripe billing portal.',
          tags: ['Users'],
          security: [
            {
              bearerAuth: [],
            },
          ],
          body: z.object({
            returnUrl: z.string().url(),
          }),
          response: {
            201: z.object({
              url: z.string().url(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { returnUrl } = request.body
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
            stripeCustomerId: true,
            subscription: {
              select: {
                stripePriceId: true,
                stripeSubscriptionId: true,
                plan: true,
                resolvedPlan: true,
              },
            },
          },
        })

        if (!user) {
          throw new ResourceNotFoundError('pt-br.notFound.user')
        }

        if (user.subscription === null) {
          // se não tem subscription deve ser criada.
          throw new ResourceNotFoundError('pt-br.notFound.user-subscription')
        }

        if (user.stripeCustomerId === null) {
          // se não tem subscription deve ser criada.
          throw new ResourceNotFoundError('pt-br.notFound.user-subscription')
        }

        try {
          const { url } = await manageSubscriptionBillingPortalSession({
            stripeCustomerId: user.stripeCustomerId,
            returnUrl,
          })
          return reply.status(201).send({
            url,
          })
        } catch (error) {
          throw new BadRequestError(
            'pt-br.stripe.error-when-trying-to-open-the-billing-portal',
          )
        }
      },
    )
}
