import {
  BadRequestError,
  dayjs,
  getOnlyPhoneNumbers,
  moneyFormatter,
  ResourceNotFoundError,
} from '@saas/core'
import bcrypt from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BalanceService } from '@/application/service/balance-service'
import { prisma } from '@/infra/database/prisma'
import { client } from '@/lib/twilio'

import { auth } from '../../middlewares/auth'

export async function receiveMessage(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/whatsapp/receive',
      {
        schema: {
          tags: ['Whatsapp'],
          summary: 'Reset user password.',
          body: z.object({
            SmsMessageSid: z.string(),
            NumMedia: z.string(),
            ProfileName: z.string(),
            MessageType: z.string(),
            SmsSid: z.string(),
            WaId: z.string(),
            SmsStatus: z.string(),
            Body: z.string(),
            To: z.string(),
            NumSegments: z.string(),
            ReferralNumMedia: z.string(),
            MessageSid: z.string(),
            AccountSid: z.string(),
            From: z.string(),
            ApiVersion: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        // const response = await client.messages.create({
        //   body: message,
        //   to: 'whatsapp:+553587135068',
        //   from: 'whatsapp:+14155238886',
        // })

        // encontrar o usuário pelo telefone
        // caso ele não tiver conta seguir o fluxo de criar uma conta.
        // ir preenchendo os dados fazendo perguntas para ele e salvando no banco de dados

        console.log(request.body)
        console.log(request.body.Body)

        const onlyPhoneNumbers = getOnlyPhoneNumbers(request.body.From)
        console.log(onlyPhoneNumbers)

        const userByPhone = await prisma.user.findUnique({
          where: {
            phone: onlyPhoneNumbers,
          },
        })

        if (!userByPhone) {
          // fluxo de cadastro

          const user = await prisma.user.create({
            data: {
              phone: onlyPhoneNumbers,
            },
          })

          // criar organization
          // criar as categories
          // criar uma conta padrao (carteira)
          // para continuar usando o Juneo é preciso fornecer o e-mail (criar customer no stripe)

          return reply.status(204).send()
        }

        if (!userByPhone.name) {
          const response = await client.messages.create({
            body: `Qual o seu nome?`,
            to: 'whatsapp:+553587135068',
            from: 'whatsapp:+14155238886',
          })
        }

        // const balanceService = new BalanceService()
        // const curr = await balanceService.getCurrentBankingBalance({
        //   organizationId: 'b11ad38b-3f45-443d-89e1-730b33899850',
        // })

        // const response = await client.messages.create({
        //   body: `Seu saldo atual é de ${moneyFormatter(curr.getAmount() / 100)}`,
        //   to: 'whatsapp:+553587135068',
        //   from: 'whatsapp:+14155238886',
        // })

        return reply.status(204).send()
      },
    )
}
