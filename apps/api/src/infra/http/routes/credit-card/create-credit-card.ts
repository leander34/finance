import {
  BadRequestError,
  dayjs,
  getCurrentActivePlan,
  RESOLVED_PLAN_NAMES,
  ResourceNotFoundError,
} from '@saas/core'
import dinero from 'dinero.js'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'
import { generateInvoiceWithIndexes } from '@/utils/generate-invoice'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'

export async function createCreditCard(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .post(
      '/organizations/:slug/credit-cards',
      {
        schema: {
          tags: ['Credit Cards'],
          summary: 'Create a credit card',
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
            financialAccountId: z
              .string({
                required_error: 'Por favor, escolha uma conta para o cartão.',
              })
              .uuid(),
            color: z.string({ required_error: 'O campo cor é obrigatório.' }),
            limit: z
              .number({
                invalid_type_error: 'Valor inválido.',
                required_error: 'Limite inválido.',
              })
              .nonnegative({ message: 'Limite não pode ser negativo.' }),
            invoiceClosingDate: z
              .number({
                invalid_type_error: 'Dia de fechamento inválido.',
                required_error: 'Dia de fechamento inválido.',
              })
              .min(1, { message: 'Dia de fechamente inválido.' })
              .max(31, { message: 'Dia de fechamente inválido.' })
              .nonnegative({
                message: 'Dia de fechamento não pode ser negativo.',
              }),
            invoiceDueDate: z
              .number({
                invalid_type_error: 'Dia de vencimento inválido.',
                required_error: 'Dia de vencimento inválido.',
              })
              .min(1, { message: 'Dia de vencimento inválido.' })
              .max(31, { message: 'Dia de vencimento inválido.' })
              .nonnegative({
                message: 'Dia de vencimento não pode ser negativo.',
              }),
            flag: z.union(
              [
                z.literal('MCC'),
                z.literal('VCC'),
                z.literal('ECC'),
                z.literal('HCC'),
                z.literal('ACC'),
                z.literal('OUTROS'),
              ],
              {
                required_error: 'O campo flag é obrigatório.',
                invalid_type_error: 'Valor inválido.',
              },
            ),
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
          color,
          financialAccountId,
          flag,
          invoiceClosingDate,
          invoiceDueDate,
          limit,
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

        const creditCardByName = await prisma.creditCard.findFirst({
          where: {
            organizationId: organization.id,
            name,
          },
        })

        if (creditCardByName) {
          throw new BadRequestError(
            'pt-br.credit-card.an-credit-card-with-this-name-already-exists',
          )
        }

        const totalCreditCardsAlreadyCreated = await prisma.creditCard.count({
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
          totalCreditCardsAlreadyCreated >=
          currentActivePlan.features.limiteCreditCards
        ) {
          throw new BadRequestError(
            'pt-br.credit-card.credit-cards-limit-already-reached-on-your-current-plan',
          )
        }

        const financialAccount = await prisma.financialAccount.findUnique({
          where: {
            id: financialAccountId,
          },
        })

        if (!financialAccount) {
          throw new ResourceNotFoundError('pt-br.notFound.financial-account')
        }

        if (financialAccount.isWallet) {
          throw new BadRequestError(
            'pt-br.credit-card.it-is-not-possible-to-create-a-card-with-the-wallet-account',
          )
        }

        console.log('dayjs', dayjs(undefined).format('YYYY-MM-DD'))

        const creditCardLimit = dinero({
          amount: limit * 100,
          currency: 'BRL',
        })

        const creditCard = await prisma.creditCard.create({
          data: {
            userId,
            organizationId: organization.id,
            color,
            name,
            limit: creditCardLimit.getAmount(),
            defaultPaymentAccountId: financialAccountId,
            invoiceClosingDate,
            invoiceDueDate,
            flag,
          },
        })

        // criar faturas para o resto do ano

        const todayDate = dayjs()
        const day = todayDate.date()
        const month = todayDate.month() + 1 // convertendo para brasil 1-12
        // const nextInvoiceMonth = invoiceClosingDate >= day ? month : month + 1
        const nextInvoiceMonth =
          invoiceClosingDate >= day
            ? month
            : todayDate.set('month', month).month() + 1

        console.log('day')
        console.log(day)
        console.log(month)
        console.log(nextInvoiceMonth)
        console.log(todayDate.set('month', month).month() + 1)
        console.log('nextInvoiceMonth')

        // até chegar em 12
        for (let i = nextInvoiceMonth; i <= 12; i++) {
          const { dueDate, month, periodEnd, periodStart, year } =
            generateInvoiceWithIndexes({
              index: i,
              invoiceClosingDate,
              invoiceDueDate,
            })
          console.log({ dueDate, month, periodEnd, periodStart, year })
          console.log('-------------------------')

          await prisma.creditCardInvoice.create({
            data: {
              periodStart,
              periodEnd,
              creditCardId: creditCard.id,
              dueDate,
              month,
              year,
            },
          })
        }

        return reply.status(201).send()
      },
    )
}
