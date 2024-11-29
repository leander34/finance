import type { FastifyInstance } from 'fastify'

import { getExpenseCategories } from './get-expense-categories'
import { getRevenueCategories } from './get-revenue-categories'

export async function categoriesRoutes(app: FastifyInstance) {
  app.register(getRevenueCategories)
  app.register(getExpenseCategories)
}
