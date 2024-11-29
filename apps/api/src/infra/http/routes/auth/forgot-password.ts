import { dayjs } from '@saas/core'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function forgotPassword(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(getUserDeviceInfo)
    .post(
      '/password/forgot',
      {
        schema: {
          tags: ['Auth'],
          summary: 'Request password recover.',
          body: z.object({
            email: z
              .string({ required_error: 'O campo e-mail é obrigatório.' })
              .email({ message: 'E-mail inválido.' }),
          }),
          response: {
            201: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { email } = request.body
        // log
        // save action if user exists
        // procurar o usuário
        const userByEmail = await prisma.user.findUnique({
          where: {
            email,
          },
        })

        if (!userByEmail) {
          // tentativa de recuperar senha de um usuário que não existe
          // throw new Error('')
          return reply.status(204).send()
        }

        // se já existir algum pedido de trocar de senha invalidar o antigo
        const attempts = await prisma.token.findMany({
          where: {
            type: 'FORGOT_PASSWORD',
            userId: userByEmail.id,
            disabled: false,
          },
        })

        await prisma.token.updateMany({
          where: {
            id: {
              in: attempts.map((at) => at.id),
            },
          },
          data: {
            disabled: true,
          },
        })

        const resetPasswordToken = await prisma.token.create({
          data: {
            userId: userByEmail.id,
            expiresIn: dayjs().add(7, 'day').unix(),
            type: 'FORGOT_PASSWORD',
          },
        })

        // loggar
        const { device, location } = await request.getUserDeviceInfo()

        const devicePrisma = await prisma.device.create({
          data: {
            ip: device.ip,
            rawUserAgency: device.rawUserAgency,
            userAgency: device.userAgency,
            language: device.language,
            phone: device.phone,
            mobile: device.mobile,
            tablet: device.tablet,
            os: device.os,
          },
        })

        let locationPrisma

        if (location) {
          locationPrisma = await prisma.location.create({
            data: {
              ip: location.ip,
              hostname: location.hostname,
              country: location.country,
              region: location.region,
              city: location.city,
              postal: location.postal,
              latitude: location.latitude,
              longitude: location.longitude,
              timezone: location.timezone,
              org: location.org,
            },
          })
        }

        await prisma.activityHistory.create({
          data: {
            userId: userByEmail.id,
            activityType: 'FORGOT_PASSWORD',
            deviceId: devicePrisma.id,
            locationId: locationPrisma ? locationPrisma.id : undefined,
          },
        })

        console.log(resetPasswordToken.id)
        // enviar e-mail para trocar a senha

        return reply.status(204).send()
      },
    )
}
