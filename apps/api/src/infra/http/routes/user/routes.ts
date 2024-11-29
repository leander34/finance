import type { FastifyInstance } from 'fastify'

import { getProfile } from './get-profile'
import { manageSubscritionOnBillingPortal } from './manage-subscription-on-billing-portal'
import { updateSubscritionOnBillingPortal } from './update-subscription-on-billing-portal'

export async function userRoutes(app: FastifyInstance) {
  app.register(getProfile)
  app.register(updateSubscritionOnBillingPortal)
  app.register(manageSubscritionOnBillingPortal)
}
