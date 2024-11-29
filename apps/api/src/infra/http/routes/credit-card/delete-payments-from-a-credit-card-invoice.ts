import { ResourceNotFoundError } from '@saas/core'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'

export async function deletePaymentsFromACreditCardInvoice(
  app: FastifyInstance,
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .delete(
      '/organizations/:slug/credit-cards/invoice/:id/payments',
      {
        schema: {
          tags: ['Credit Cards'],
          summary: 'Delete payments from a credit card invoice',
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
            id: z.string().uuid(),
          }),
          response: {
            201: z.null(),
          },
        },
      },
      async (request, reply) => {
        await request.getCurrentUserId()
        const { slug, id } = request.params
        const { organization } = await request.getUserMembership(slug)

        const invoice = await prisma.creditCardInvoice.findUnique({
          where: {
            id,
            creditCard: {
              organizationId: organization.id,
            },
          },
        })

        if (!invoice) {
          throw new ResourceNotFoundError('pt-br.notFound.invoice')
        }

        await prisma.transaction.deleteMany({
          where: {
            creditCardInvoicePaymentId: invoice.id,
          },
        })

        return reply.status(201).send()
      },
    )
}
