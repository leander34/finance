import {
  BadRequestError,
  getPlanByName,
  PLAN_NAMES,
  RESOLVED_PLAN_NAMES,
  ResourceNotFoundError,
} from '@saas/core'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { createUpdateSubscriptionBillingPortalSession } from '@/application/stripe'
import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'

export async function updateSubscritionOnBillingPortal(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/users/billing-portal/update-subscrition',
      {
        schema: {
          summary: 'Update user subscription by stripe billing portal.',
          tags: ['Users'],
          security: [
            {
              bearerAuth: [],
            },
          ],
          body: z.object({
            updateToPlan: z.nativeEnum(PLAN_NAMES),
            returnUrl: z.string().url(),
            returnSuccessUpdateUrl: z.string().url(),
          }),
          response: {
            201: z.object({
              url: z.string().url(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { updateToPlan, returnUrl, returnSuccessUpdateUrl } = request.body
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

        const currentPlan = user.subscription?.plan
        if (updateToPlan === currentPlan) {
          throw new BadRequestError(
            'pt-br.user.subscription.unable-to-upgrade-to-the-same-plan',
          )
        }

        const plan = getPlanByName(updateToPlan)

        if (!plan) {
          throw new ResourceNotFoundError('pt-br.notFound.subscription-plan')
        }

        if (
          updateToPlan === PLAN_NAMES.FREE ||
          updateToPlan === PLAN_NAMES.FREE_PREMIUM
        ) {
          throw new BadRequestError(
            'pt-br.user.subscription.unable-to-upgrade-to-the-free-plan',
          )
        }

        const currentPlanResolved = user.subscription?.resolvedPlan
        const isPremium = currentPlanResolved === RESOLVED_PLAN_NAMES.PREMIUM

        if (isPremium) {
          throw new BadRequestError(
            'pt-br.user.subscription.user-already-has-the-premium-plan',
          )
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
          const { url } = await createUpdateSubscriptionBillingPortalSession({
            organzationOwnerUserEmail: user.email,
            updateToPlan,
            userStripeSubscriptionId: user.subscription.stripeSubscriptionId,
            stripeCustomerId: user.stripeCustomerId,
            returnUrl,
            returnSuccessUpdateUrl,
          })
          return reply.status(201).send({
            url,
          })
        } catch (error) {
          throw new BadRequestError(
            'pt-br.stripe.error-while-trying-to-update-subscription',
          )
        }
      },
    )
}
