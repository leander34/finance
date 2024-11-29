import type { FastifyInstance } from 'fastify'

import { fetchBanks } from './fetch-banks'

export async function banksRoutes(app: FastifyInstance) {
  app.register(fetchBanks)
}
