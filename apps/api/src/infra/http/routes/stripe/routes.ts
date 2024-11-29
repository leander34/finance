import type { FastifyInstance } from 'fastify'

import { stripeWebhook } from './webhook'

export async function stripeRoutes(app: FastifyInstance) {
  // app.register(createUpdateSubscritionBillingPortalSession)
  app.register(stripeWebhook)
}
