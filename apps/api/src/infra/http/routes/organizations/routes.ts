import type { FastifyInstance } from 'fastify'

import { getMembership } from './get-membership'
import { getOrgnization } from './get-organization'
import { getOrgnizations } from './get-organizations'

export async function organizationsRoutes(app: FastifyInstance) {
  // app.register(getProfile)
  app.register(getOrgnization)
  app.register(getOrgnizations)
  app.register(getMembership)
}
