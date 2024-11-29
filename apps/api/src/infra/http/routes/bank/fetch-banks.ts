import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function fetchBanks(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .get(
      '/banks',
      {
        schema: {
          tags: ['Banks'],
          summary: 'Fetch all banks',
          security: [
            {
              bearerAuth: [],
            },
          ],
          querystring: z.object({
            main: z.boolean().optional(),
          }),
          response: {
            200: z.object({
              banks: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  imageUrl: z.string().url(),
                  openFinanceIntegration: z.boolean(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        await request.getCurrentUserId()
        const { main } = request.query

        const banks = await prisma.bank.findMany({
          where: {
            main,
          },
          select: {
            id: true,
            name: true,
            imageUrl: true,
            openFinanceIntegration: true,
          },
          orderBy: {
            name: 'asc',
          },
        })

        return reply.status(200).send({
          banks,
        })
      },
    )
}
