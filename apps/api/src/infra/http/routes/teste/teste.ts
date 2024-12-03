import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export async function teste(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/teste',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Create a transaction',
        response: {
          200: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      return reply.status(200).send({
        message: 'Olá, Leander Borararara',
      })
    },
  )
}
