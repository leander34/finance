import type { FastifyInstance } from 'fastify'

import { receiveMessage } from './receive-message'
import { sendMessage } from './send-message'

export async function whatsappRoutes(app: FastifyInstance) {
  app.register(sendMessage)
  app.register(receiveMessage)
}
