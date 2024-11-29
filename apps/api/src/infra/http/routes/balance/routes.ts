import type { FastifyInstance } from 'fastify'

import { getCashFlowChart } from './get-cash-flow-chart'
import { getOverviewData } from './get-overview-data'
import { getRealMonthlyBalance } from './get-real-monthly-balance'

export async function balanceRoutes(app: FastifyInstance) {
  app.register(getRealMonthlyBalance)
  app.register(getOverviewData)
  app.register(getCashFlowChart)
}
