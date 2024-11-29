import { BadRequestError, ResourceNotFoundError } from '@saas/core'
import dinero from 'dinero.js'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { CreditCardService } from '@/application/service/credit-card-service'
import { prisma } from '@/infra/database/prisma'
import { updateCurrentInvoice, updateInvoice } from '@/utils/generate-invoice'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function editCreditCard(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .put(
      '/organizations/:slug/credit-cards/:id',
      {
        schema: {
          tags: ['Credit Cards'],
          summary: 'Edit a credit card',
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
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const creditCardService = new CreditCardService()
        await request.getCurrentUserId()
        const { slug, id } = request.params
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

        const creditCard = await prisma.creditCard.findFirst({
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

        if (!creditCard) {
          throw new ResourceNotFoundError('pt-br.notFound.credit-card')
        }

        if (creditCard.blockedByExpiredSubscription) {
          throw new BadRequestError(
            'pt-br.credit-card.blocked-by-expired-subscription',
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

        await prisma.$transaction(async (tx) => {
          if (
            creditCard.invoiceClosingDate !== invoiceClosingDate ||
            creditCard.invoiceDueDate !== invoiceDueDate
          ) {
            // precisa atualizar todas as faturas
            // todas os some as futuras?
            // vou alterar apenas as futuras e atual
            // como pegar a fatura atual
            // 2024-10-04

            const currentCreditCardInvoices =
              await creditCardService.getCurrentCreditCardInvoice({
                organizationId: organization.id,
                creditCardId: creditCard.id,
              })

            const nextCreditCardInvoices =
              await creditCardService.getNextCreditCardInvoices({
                organizationId: organization.id,
                creditCardId: creditCard.id,
              })

            if (currentCreditCardInvoices) {
              const { periodEnd, dueDate } = updateCurrentInvoice({
                currentPeriodStart: currentCreditCardInvoices.periodStart,
                currentPeriodEnd: currentCreditCardInvoices.periodEnd,
                currentDueDate: currentCreditCardInvoices.dueDate,
                invoiceClosingDate,
                invoiceDueDate,
                month: currentCreditCardInvoices.month,
                year: currentCreditCardInvoices.year,
              })
              console.log('Current')
              console.log({
                periodEnd,
                dueDate,
                currentPeriodStart: currentCreditCardInvoices.periodStart,
                month: currentCreditCardInvoices.month,
                year: currentCreditCardInvoices.year,
              })
              console.log('-------------')

              await tx.creditCardInvoice.update({
                where: {
                  id: currentCreditCardInvoices.id,
                },
                data: {
                  periodEnd,
                  dueDate,
                },
              })
            }

            const updatedInvoices = nextCreditCardInvoices.map((invoice) => {
              const { periodStart, periodEnd, dueDate } = updateInvoice({
                invoiceClosingDate,
                invoiceDueDate,
                month: invoice.month,
                year: invoice.year,
              })
              console.log('Next')
              console.log({
                periodStart,
                periodEnd,
                dueDate,
                month: invoice.month,
                year: invoice.year,
              })
              console.log('-------------')

              return tx.creditCardInvoice.update({
                where: {
                  id: invoice.id,
                },
                data: {
                  periodStart,
                  periodEnd,
                  dueDate,
                },
              })
            })

            await Promise.all(updatedInvoices)
          }
          const creditCardLimit = dinero({
            amount: limit * 100,
            currency: 'BRL',
          })

          await tx.creditCard.update({
            where: {
              id,
            },
            data: {
              color,
              name,
              limit: creditCardLimit.getAmount(),
              defaultPaymentAccountId: financialAccountId,
              invoiceClosingDate,
              invoiceDueDate,
              flag,
            },
          })
        })

        return reply.status(204).send()
      },
    )
}
