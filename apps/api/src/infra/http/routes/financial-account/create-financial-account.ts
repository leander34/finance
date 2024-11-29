import {
  BadRequestError,
  getCurrentActivePlan,
  RESOLVED_PLAN_NAMES,
  ResourceNotFoundError,
} from '@saas/core'
import dinero from 'dinero.js'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function createFinancialAccount(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .post(
      '/organizations/:slug/financial-accounts',
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
          }),
          body: z.object({
            name: z.string({ required_error: 'O campo nome é obrigatório.' }),
            initialBalance: z.coerce.number().default(0),
            accountType: z
              .union([
                z.literal('CC'),
                z.literal('CP'),
                z.literal('CI'),
                z.literal('DINHEIRO'),
                z.literal('OUTROS'),
              ])
              .default('CC'),
            financialInstitutionId: z
              .string({ required_error: 'Por favor, escolha um banco.' })
              .uuid(),
            accountIntegrationType: z
              .union([z.literal('OPEN_FINANCE'), z.literal('MANUAL')])
              .default('MANUAL'),
            color: z.string({ required_error: 'O campo cor é obrigatório.' }),
            visibledInOverallBalance: z.coerce.boolean().default(true),
          }),
          response: {
            201: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { slug } = request.params
        const { organization } = await request.getUserMembership(slug)
        const {
          name,
          initialBalance,
          color,
          visibledInOverallBalance,
          financialInstitutionId,
          accountIntegrationType,
          accountType,
        } = request.body

        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            subscription: true,
          },
        })

        if (!user) {
          throw new ResourceNotFoundError('pt-br.notFound.user')
        }

        const financialAccountByName = await prisma.financialAccount.findFirst({
          where: {
            organizationId: organization.id,
            name,
          },
        })

        if (financialAccountByName) {
          throw new BadRequestError(
            'pt-br.financial-account.an-account-with-this-name-already-exists',
          )
        }

        const totalAccountAlreadyCreated = await prisma.financialAccount.count({
          where: {
            organizationId: organization.id,
          },
        })

        const currentActivePlan = getCurrentActivePlan({
          resolvedPlan: user.subscription?.resolvedPlan as
            | RESOLVED_PLAN_NAMES
            | undefined,
          status: user.subscription?.status,
        })

        if (
          totalAccountAlreadyCreated >=
          currentActivePlan.features.limiteFinancialAccounts
        ) {
          throw new BadRequestError(
            'pt-br.financial-account.account-limit-already-reached-on-your-current-plan',
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
        const balance = dinero({
          amount: initialBalance * 100,
          currency: 'BRL',
        })
        await prisma.financialAccount.create({
          data: {
            userId,
            organizationId: organization.id,
            color,
            name,
            initialBalance: balance.getAmount(),
            visibledInOverallBalance,
            bankId: financialInstitutionId,
            accountType,
            accountIntegrationType,
          },
        })

        return reply.status(201).send()
      },
    )
}
