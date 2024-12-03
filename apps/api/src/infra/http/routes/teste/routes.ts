import type { FastifyInstance } from 'fastify'

import { teste } from './teste'
// import { markAnRevenueTransactionAsPaid } from './mark-an-revenue-transaction-as-paid'

export async function testeRoutes(app: FastifyInstance) {
  app.register(teste)
}
