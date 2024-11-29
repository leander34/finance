/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from '@saas/env'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

// import type Stripe from 'stripe'
import {
  handleProcessWebhookCancelSubscription,
  handleProcessWebhookUpdatedSubscription,
} from '@/application/stripe'
import { stripe } from '@/lib/stripe'

export async function stripeWebhook(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/stripe/webhook',
    {
      schema: {
        summary: 'Stripe webhook.',
        tags: ['Stripe'],
      },
      config: {
        rawBody: true,
      },
    },
    async (request, reply) => {
      const rawBody = request.rawBody!
      const signature = request.headers['stripe-signature']!

      // let event: Stripe.Event

      try {
        const event = stripe.webhooks.constructEvent(
          rawBody,
          signature,
          env.STRIPE_WEBHOOK_SECRET,
        )

        switch (event.type) {
          case 'customer.subscription.created':
          case 'customer.subscription.updated':
            await handleProcessWebhookUpdatedSubscription(event.data)
            break
          case 'customer.subscription.deleted':
            await handleProcessWebhookCancelSubscription(event.data) // deletar a subscription do banco e criar uma nova com o free
            break
          default:
          //   console.log(`Unhandled event type ${event.type}`)
        }

        return reply.status(200).send({ received: true })
      } catch (error: any) {
        console.error(`Stripe Webhook Error: ${error.message}`)
        return reply.status(400).send(`Webhook Error: ${error.message}`)
      }
    },
  )
}
