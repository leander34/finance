import { BadRequestError, dayjs, ResourceNotFoundError } from '@saas/core'
import dinero from 'dinero.js'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function editTransaction(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .put(
      '/organizations/:slug/transactions/:id',
      {
        schema: {
          tags: ['Transactions'],
          summary: 'Edit a transaction',
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
            transactionFromEntity: z.union([
              z.literal('FINANCIAL_ACCOUNT'),
              z.literal('CREDIT_CARD'),
            ]),
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
            degreeOfNeed: z
              .number({
                coerce: true,
                invalid_type_error: 'Grau de necessidade inválido.',
              })
              .nullish()
              .default(null),
            skip: z.coerce.boolean().default(false),
            description: z.string(),
            alreadyPaid: z.coerce.boolean().default(true),
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
        const {
          transactionFromEntity,
          amount,
          alreadyPaid,
          realizationDate,
          degreeOfNeed,
          skip,
          description,
        } = request.body

        const transaction = await prisma.transaction.findUnique({
          where: {
            id,
            organizationId: organization.id,
          },
        })

        if (!transaction) {
          throw new ResourceNotFoundError('pt-br.notFound.transaction')
        }

        if (
          transaction.financialAccountId === null &&
          transactionFromEntity === 'FINANCIAL_ACCOUNT'
        ) {
          throw new ResourceNotFoundError('pt-br.notFound.transaction')
        }

        if (
          transaction.creditCardId === null &&
          transactionFromEntity === 'CREDIT_CARD'
        ) {
          throw new ResourceNotFoundError('pt-br.notFound.transaction')
        }

        if (transaction.type === 'EXPENSE' && amount > 0) {
          throw new BadRequestError(
            'pt-br.transactions.transaction-amount-does-not-match-the-chosen-type',
          )
        }

        if (transaction.type === 'REVENUE' && amount < 0) {
          throw new BadRequestError(
            'pt-br.transactions.transaction-amount-does-not-match-the-chosen-type',
          )
        }

        if (transaction.type === 'REVENUE' && degreeOfNeed) {
          throw new BadRequestError('pt-br.transactions.invalid-degree-of-need')
        }
        if (
          transaction.type === 'EXPENSE' &&
          (!degreeOfNeed || ![1, 2, 3].includes(degreeOfNeed))
        ) {
          throw new BadRequestError('pt-br.transactions.invalid-degree-of-need')
        }

        const newTransactionValue = dinero({
          amount: amount * 100,
          currency: 'BRL',
        })

        await prisma.transaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            amount: newTransactionValue.getAmount(),
            status: alreadyPaid ? 'PAID' : 'UNPAID',
            // paidAt: alreadyPaid ? dayjs().toDate() : null,
            realizationDate,
            degreeOfNeed: degreeOfNeed ?? null,
            skip,
            description,
          },
        })

        return reply.status(204).send()
      },
    )
}
