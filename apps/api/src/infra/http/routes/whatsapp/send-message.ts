import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'
import { client } from '@/lib/twilio'

import { auth } from '../../middlewares/auth'

export async function sendMessage(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/whatsapp/send',
      {
        schema: {
          tags: ['Whatsapp'],
          summary: 'Reset user password.',
          body: z.object({
            message: z.string({ required_error: 'Digite uma messagem.' }),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { message } = request.body

        const response = await client.messages.create({
          body: message,
          to: 'whatsapp:+553587135068',
          from: 'whatsapp:+14155238886',
        })

        console.log(response.sid)

        return reply.status(204).send()
      },
    )
}
