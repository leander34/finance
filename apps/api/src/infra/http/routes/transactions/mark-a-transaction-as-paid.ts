import { BadRequestError, dayjs, ResourceNotFoundError } from '@saas/core'
import dinero from 'dinero.js'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function markATransactionAsPaid(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .patch(
      '/organizations/:slug/transactions/:id/mark-as-paid',
      {
        schema: {
          tags: ['Transactions'],
          summary: 'Mark an expense transaction as paid',
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
            id: z.string().uuid({ message: 'Id inválido.' }),
          }),
          body: z.object({
            amount: z
              .number({
                coerce: true,
                invalid_type_error: 'Valor da transação inválido.',
              })
              .refine((value) => value !== 0, {
                message: 'O valor da transação não pode ser zero.',
              }),
            realizationDate: z
              .string({
                required_error: 'O campo data de realização é obrigatório.',
              })
              .refine(
                (value) => {
                  const validFormat = 'YYYY-MM-DD'
                  const isDateValid = dayjs(value, validFormat, true).isValid()
                  return isDateValid
                },
                {
                  path: ['realizationDate'],
                  message: 'Formato da data inválido.',
                },
              ),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        await request.getCurrentUserId()
        const { slug, id } = request.params
        const { organization } = await request.getUserMembership(slug)
        const { realizationDate, amount } = request.body

        const transaction = await prisma.transaction.findUnique({
          where: {
            id,
            organizationId: organization.id,
            type: {
              in: ['EXPENSE', 'REVENUE'],
            },
          },
        })

        if (!transaction) {
          throw new ResourceNotFoundError('pt-br.notFound.transaction')
        }

        if (transaction.status === 'PAID') {
          throw new BadRequestError(
            'pt-br.transactions.transaction-already-paid',
          )
        }

        const transactionValue = dinero({
          amount: Math.round(amount * 100),
          currency: 'BRL',
        })

        await prisma.transaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            // paidAt: dayjs().toDate(),
            amount: transactionValue.getAmount(),
            realizationDate,
            status: 'PAID',
          },
        })

        return reply.status(204).send()
      },
    )
}
