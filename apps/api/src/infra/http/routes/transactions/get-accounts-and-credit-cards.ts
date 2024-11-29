import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'

export async function getAccountsAndCreditCards(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .get(
      '/organizations/:slug/accounts-and-credit-cards',
      {
        schema: {
          tags: ['Transactions'],
          summary:
            'Get all financial accounts and credit cards from a organization.',
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
          }),
          // querystring: z.object({
          //   type: z.nativeEnum(TransactionType).nullish().default(null),
          // }),
          response: {
            200: z.object({
              items: z.array(
                z.object({
                  financialAccountId: z.string().uuid().nullable(),
                  creditCardId: z.string().uuid().nullable(),
                  name: z.string(),
                  color: z.string(),
                  imageUrl: z.string().url(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { slug } = request.params
        const { organization } = await request.getUserMembership(slug)
        const financialAccountsQuery = await prisma.financialAccount.findMany({
          where: {
            organizationId: organization.id,
            blockedByExpiredSubscription: false,
            archivedAt: null,
            organization: {
              members: {
                some: {
                  userId,
                },
              },
            },
          },
          select: {
            id: true,
            name: true,
            color: true,
            bank: {
              select: {
                imageUrl: true,
              },
            },
          },
        })

        const creditCardsQuery = await prisma.creditCard.findMany({
          where: {
            organizationId: organization.id,
            blockedByExpiredSubscription: false,
            archivedAt: null,
            organization: {
              members: {
                some: {
                  userId,
                },
              },
            },
          },
          select: {
            id: true,
            name: true,
            color: true,
            defaultPaymentAccount: {
              select: {
                bank: {
                  select: {
                    imageUrl: true,
                  },
                },
              },
            },
          },
        })

        const financialAccounts = financialAccountsQuery.map(
          ({ bank, id, ...account }) => ({
            ...account,
            financialAccountId: id,
            creditCardId: null,
            imageUrl: bank.imageUrl,
          }),
        )

        const creditCards = creditCardsQuery.map(
          ({ defaultPaymentAccount, id, ...creditCard }) => ({
            ...creditCard,
            creditCardId: id,
            financialAccountId: null,
            imageUrl: defaultPaymentAccount.bank.imageUrl,
          }),
        )

        const items = [...financialAccounts, ...creditCards]
        // const items =
        //   type === 'EXPENSE'
        //     ? [...financialAccounts, ...creditCards]
        //     : [...financialAccounts]

        return reply.status(200).send({
          items,
        })
      },
    )
}
