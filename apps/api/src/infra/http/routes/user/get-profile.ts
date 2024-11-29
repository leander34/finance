import { SubscriptionPlan, SubscriptionResolvedPlan } from '@prisma/client'
import {
  PLAN_NAMES,
  RESOLVED_PLAN_NAMES,
  ResourceNotFoundError,
} from '@saas/core'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'

export async function getProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/profile',
      {
        schema: {
          summary: 'Get logged user profile.',
          tags: ['Users'],
          security: [
            {
              bearerAuth: [],
            },
          ],
          response: {
            200: z.object({
              user: z.object({
                id: z.string().uuid(),
                name: z.string(),
                email: z.string().email(),
                phone: z.string().nullable(),
                avatarUrl: z.string().nullable(),
                document: z.string().nullable(),
                firstLogin: z.boolean(),
                firstLoginToday: z.boolean(),
                createdAt: z.date(),
                subscription: z.object({
                  currentPlan: z
                    .nativeEnum(PLAN_NAMES)
                    .or(z.nativeEnum(SubscriptionPlan)),
                  resolvedPlan: z
                    .nativeEnum(RESOLVED_PLAN_NAMES)
                    .or(z.nativeEnum(SubscriptionResolvedPlan)),
                  resolvedActivePlan: z.nativeEnum(RESOLVED_PLAN_NAMES),
                  // stripeSubscriptionId: z.string().nullable(),
                  // stripePriceId: z.string().nullable(),
                  status: z.string().nullable(),
                  currentPeriodStart: z.number().nullable(),
                  currentPeriodEnd: z.number().nullable(),
                }),
              }),
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
            stripeCustomerId: true,
            firstLogin: true,
            firstLoginToday: true,
            subscription: {
              select: {
                plan: true,
                resolvedPlan: true,
                // stripePriceId: true,
                // stripeSubscriptionId: true,
                status: true,
                currentPeriodStart: true,
                currentPeriodEnd: true,
              },
            },
          },
        })

        if (!user) {
          throw new ResourceNotFoundError('pt-br.notFound.user')
        }
        // se o status for diferente de active
        const currentPlan = user.subscription?.plan ?? PLAN_NAMES.FREE

        const currentPlanResolved = user.subscription?.resolvedPlan
          ? user.subscription.resolvedPlan
          : RESOLVED_PLAN_NAMES.FREE

        const isPremium = currentPlanResolved === RESOLVED_PLAN_NAMES.PREMIUM
        const isActiveOrInTrialing =
          user.subscription?.status === 'active' ||
          user.subscription?.status === 'trialing'

        const resolvedActivePlan =
          isPremium && isActiveOrInTrialing
            ? RESOLVED_PLAN_NAMES.PREMIUM
            : RESOLVED_PLAN_NAMES.FREE

        // try {
        //   const teste = await stripe.customers.createBalanceTransaction(
        //     user.stripeCustomerId!,
        //     {
        //       amount: -1190,
        //       currency: 'brl',
        //       description: 'teste aqui da api',
        //     },
        //   )
        //   const customer = await stripe.customers.list({ email: user.email })
        // } catch (error) {
        //   throw new Error('')
        // }

        return reply.status(200).send({
          user: {
            id: user.id,
            name: user.name,
            document: user.document,
            email: user.email,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            firstLogin: user.firstLogin,
            firstLoginToday: user.firstLoginToday,
            createdAt: user.createdAt,
            subscription: {
              currentPlan,
              resolvedPlan:
                user.subscription?.resolvedPlan ?? RESOLVED_PLAN_NAMES.FREE,
              resolvedActivePlan,
              // stripePriceId: user.subscription?.stripePriceId ?? null,
              // stripeSubscriptionId:
              //   user.subscription?.stripeSubscriptionId ?? null,
              status: user.subscription?.status ?? null,
              currentPeriodStart:
                user.subscription?.currentPeriodStart.toNumber() ?? null,
              currentPeriodEnd:
                user.subscription?.currentPeriodEnd.toNumber() ?? null,
            },
          },
        })
      },
    )
}
