import { BadRequestError, ResourceNotFoundError } from '@saas/core'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function editFinancialAccount(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .put(
      '/organizations/:slug/financial-accounts/:id',
      {
        schema: {
          tags: ['Financial Accounts'],
          summary: 'Create a financial account',
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
            id: z.string().uuid(),
          }),
          body: z.object({
            name: z.string({ required_error: 'O campo nome é obrigatório.' }),
            accountType: z.union([
              z.literal('CC'),
              z.literal('CP'),
              z.literal('CI'),
              z.literal('DINHEIRO'),
              z.literal('OUTROS'),
            ]),
            financialInstitutionId: z
              .string({ required_error: 'Por favor, escolha um banco.' })
              .uuid(),
            color: z.string({ required_error: 'O campo cor é obrigatório.' }),
            visibledInOverallBalance: z.coerce.boolean().default(true),
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
          name,
          color,
          visibledInOverallBalance,
          accountType,
          financialInstitutionId,
        } = request.body
        const financialAccount = await prisma.financialAccount.findFirst({
          where: {
            AND: [
              {
                organizationId: organization.id,
              },
              {
                id,
              },
            ],
          },
        })

        if (!financialAccount) {
          throw new ResourceNotFoundError('pt-br.notFound.financial-account')
        }

        if (financialAccount.blockedByExpiredSubscription) {
          throw new BadRequestError(
            'pt-br.financial-account.blocked-by-expired-subscription',
          )
        }

        const bank = await prisma.bank.findUnique({
          where: {
            id: financialInstitutionId,
          },
        })

        if (!bank) {
          throw new ResourceNotFoundError('pt-br.notFound.bank')
        }

        await prisma.financialAccount.update({
          where: {
            id: financialAccount.id,
          },
          data: {
            color,
            name,
            visibledInOverallBalance,
            bankId: financialInstitutionId,
            accountType,
          },
        })

        return reply.status(204).send()
      },
    )
}
