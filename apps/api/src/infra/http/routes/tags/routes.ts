import type { FastifyInstance } from 'fastify'

import { createTag } from './create-tag'
import { getAllTags } from './get-all-tags'
// import { getExpenseTags } from './get-expense-tags'
// import { getRevenueTags } from './get-revenue-tags'

export async function tagsRoutes(app: FastifyInstance) {
  // app.register(getExpenseTags)
  // app.register(getRevenueTags)
  app.register(getAllTags)
  app.register(createTag)
}
