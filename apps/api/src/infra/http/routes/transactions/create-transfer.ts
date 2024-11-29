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
import { calcNextRecurrenceDate } from '@/utils/calc-next-recurrence-date'
import { getAmountRecurrenceRepetition } from '@/utils/get-amount-recurrence-repetition'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function createTransfer(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .post(
      '/organizations/:slug/transfers',
      {
        schema: {
          tags: ['Transactions'],
          summary: 'Create a transfer',
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
          }),
          body: z
            .object({
              amount: z
                .number({
                  coerce: true,
                  invalid_type_error: 'Valor da transação inválido.',
                })
                .positive({ message: 'Valor da transação inválido.' }),
              realizationDate: z
                .string({
                  required_error: 'O campo data de realização é obrigatório.',
                })
                .refine(
                  (value) => {
                    const validFormat = 'YYYY-MM-DD'
                    const isDateValid = dayjs(
                      value,
                      validFormat,
                      true,
                    ).isValid()
                    return isDateValid
                  },
                  {
                    path: ['realizationDate'],
                    message: 'Formato da data inválido.',
                  },
                ),
              sourceAccount: z
                .string({ required_error: 'Conta inválida.' })
                .uuid({ message: 'Conta inválida.' }),
              destinationAccount: z
                .string({ required_error: 'Conta inválida.' })
                .uuid({ message: 'Conta inválida.' }),
              observation: z.string().nullish(),
              description: z.string(),
              tags: z.array(z.string().uuid()).nullish().default([]),
              launchType: z
                .union([
                  z.literal('SINGLE_LAUNCH'),
                  z.literal('RECURRENT_LAUNCH'),
                ])
                .default('SINGLE_LAUNCH'),
              recurrencePeriod: z
                .union([
                  z.literal('anual'),
                  z.literal('semestral'),
                  z.literal('trimestral'),
                  z.literal('bimestral'),
                  z.literal('mensal'),
                  z.literal('quinzenal'),
                  z.literal('semanal'),
                  z.literal('diario'),
                ])
                .default('mensal')
                .nullish(),
            })
            .refine(
              (data) => {
                if (data.sourceAccount === data.destinationAccount) return false
                return true
              },
              {
                path: ['sourceAccount', 'destinationAccount'],
                message:
                  'Não é permitido fazer transferências para a mesma conta.',
              },
            )
            .refine(
              (data) => {
                if (
                  data.launchType === 'RECURRENT_LAUNCH' &&
                  !data.recurrencePeriod
                ) {
                  return false
                }
                return true
              },
              {
                path: ['recurrencePeriod'],
                message:
                  'Por favor, selecione uma frequência de repetição para a despesa fixa.',
              },
            ),
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
          amount,
          realizationDate,
          description,
          tags,
          sourceAccount: sourceAccountId,
          destinationAccount: destinationAccountId,
          recurrencePeriod,
          launchType,
          observation,
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

        const sourceAccount = await prisma.financialAccount.findUnique({
          where: {
            id: sourceAccountId,
            organizationId: organization.id,
          },
        })

        if (!sourceAccount) {
          throw new ResourceNotFoundError('pt-br.notFound.financial-account')
        }

        if (sourceAccount.blockedByExpiredSubscription) {
          throw new BadRequestError(
            'pt-br.financial-account.blocked-by-expired-subscription',
          )
        }

        const destinationAccount = await prisma.financialAccount.findUnique({
          where: {
            id: destinationAccountId,
            organizationId: organization.id,
          },
        })

        if (!destinationAccount) {
          throw new ResourceNotFoundError('pt-br.notFound.financial-account')
        }

        if (destinationAccount.blockedByExpiredSubscription) {
          throw new BadRequestError(
            'pt-br.financial-account.blocked-by-expired-subscription',
          )
        }

        const totalTransferCreatedToday = await prisma.transaction.count({
          where: {
            organizationId: organization.id,
            type: {
              in: ['TRANSFER'],
            },
            createdAt: {
              gte: dayjs().startOf('day').toDate(),
              lte: dayjs().endOf('day').toDate(),
            },
          },
        })

        const currentActivePlan = getCurrentActivePlan({
          resolvedPlan: user.subscription?.resolvedPlan as
            | RESOLVED_PLAN_NAMES
            | undefined,
          status: user.subscription?.status,
        })

        if (
          totalTransferCreatedToday >=
          currentActivePlan.features.transferLimitPerDay
        ) {
          throw new BadRequestError(
            'pt-br.transactions.daily-transfers-limit-reached',
          )
        }
        // preciso saber se a conta de origin possui saldo disponivel para transferencia
        const transferValue = dinero({
          amount: Math.round(amount * 100),
          currency: 'BRL',
        })

        if (launchType === 'SINGLE_LAUNCH') {
          await prisma.transaction.create({
            data: {
              userId,
              organizationId: organization.id,
              financialAccountId: sourceAccountId,
              destinationFinancialAccountId: destinationAccountId,
              type: 'TRANSFER',
              amount: transferValue.getAmount(),
              status: 'PAID',
              // paidAt: alreadyPaid ? dayjs().toDate() : undefined,
              realizationDate,
              description,
              skip: false,
              observation,
              transactionsTags: tags
                ? {
                    createMany: {
                      data: tags.map((tag) => ({ tagId: tag })),
                    },
                  }
                : undefined,
            },
          })
        }

        if (launchType === 'RECURRENT_LAUNCH' && recurrencePeriod) {
          await prisma.$transaction(async (tx) => {
            const recurrence = await tx.recurrence.create({
              data: {
                organizationId: organization.id,
                userId,
                financialAccountId: sourceAccountId,
                destinationFinancialAccountId: destinationAccountId,
                amount: transferValue.getAmount(),
                description,
                realizationDate,
                type: 'TRANSFER',
                observation,
                skip: false,
                tags: tags
                  ? {
                      createMany: {
                        data: tags.map((tag) => ({ tagId: tag })),
                      },
                    }
                  : undefined,
                frequency: recurrencePeriod,
                lastRealizationDate: '',
                nextDate: '',
                endDate: null,
                startDate: dayjs().format('YYYY-MM-DD'),
                lastProcessingDate: dayjs().format('YYYY-MM-DD'),
                day: dayjs(realizationDate).date(),
              },
            })
            const { recurrenceRepetition, interval } =
              getAmountRecurrenceRepetition(recurrencePeriod, realizationDate)
            let recurrenceRealizationDate = realizationDate

            for (let i = 0; i < recurrenceRepetition; i++) {
              await tx.transaction.create({
                data: {
                  userId,
                  organizationId: organization.id,
                  financialAccountId: sourceAccountId,
                  destinationFinancialAccountId: destinationAccountId,
                  recurrenceId: recurrence.id,
                  type: 'TRANSFER',
                  amount: transferValue.getAmount(),
                  status: i === 0 ? 'PAID' : 'UNPAID',
                  realizationDate: recurrenceRealizationDate,
                  skip: false,
                  description,
                  observation,
                  transactionsTags: tags
                    ? {
                        createMany: {
                          data: tags.map((tag) => ({ tagId: tag })),
                        },
                      }
                    : undefined,
                },
              })

              if (i + 1 !== recurrenceRepetition) {
                recurrenceRealizationDate = calcNextRecurrenceDate(
                  recurrenceRealizationDate,
                  recurrencePeriod,
                  dayjs(realizationDate).date(),
                )
              }
            }

            await tx.recurrence.update({
              where: {
                id: recurrence.id,
              },
              data: {
                lastRealizationDate: recurrenceRealizationDate,
                nextDate: dayjs().add(interval, 'year').format('YYYY-MM-DD'),
                endDate: null,
              },
            })
          })
        }

        return reply.status(201).send()
      },
    )
}
