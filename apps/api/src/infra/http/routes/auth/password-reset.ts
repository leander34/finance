import { BadRequestError, dayjs, ResourceNotFoundError } from '@saas/core'
import bcrypt from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function passwordReset(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(getUserDeviceInfo)
    .post(
      '/password/reset',
      {
        schema: {
          tags: ['Auth'],
          summary: 'Reset user password.',
          body: z.object({
            password: z
              .string({ required_error: 'O campo senha é obrigatório.' })
              .min(6, {
                message:
                  'Senha inválida. Sua senha deve conter pelo menos 6 caracteres.',
              }),
            code: z
              .string({ required_error: 'Código de recuparação não enviado.' })
              .uuid({ message: 'Código inválido.' }),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { device, location } = await request.getUserDeviceInfo()
        const { password, code } = request.body

        // logar a chama dessa rota

        const passwordRecoverToken = await prisma.token.findUnique({
          where: {
            type: 'FORGOT_PASSWORD',
            id: code,
          },
        })

        if (!passwordRecoverToken) {
          // loggar tentativa de recoperar a senha com token inválido
          throw new ResourceNotFoundError('pt-br.password-reset.invalid-code')
        }

        if (passwordRecoverToken.disabled) {
          throw new BadRequestError('pt-br.password-reset.disabled')
        }

        const isTokenExpired = dayjs
          .unix(passwordRecoverToken.expiresIn)
          .isBefore(dayjs())

        if (isTokenExpired) {
          throw new BadRequestError('pt-br.password-reset.expired')
        }

        const newPasswordHashed = await bcrypt.hash(password, 10)

        await prisma.user.update({
          where: {
            id: passwordRecoverToken.userId,
          },
          data: {
            password: newPasswordHashed,
            activitiesHistory: {
              create: {
                activityType: 'PASSWORD_RESET',
                device: device
                  ? {
                      create: {
                        ip: device.ip,
                        rawUserAgency: device.rawUserAgency,
                        userAgency: device.userAgency,
                        language: device.language,
                        phone: device.phone,
                        mobile: device.mobile,
                        tablet: device.tablet,
                        os: device.os,
                      },
                    }
                  : {},
                location: location
                  ? {
                      create: {
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
                    }
                  : {},
              },
            },
            tokens: {
              update: {
                where: {
                  id: passwordRecoverToken.id,
                },
                data: {
                  disabled: true,
                },
              },
            },
          },
        })

        return reply.status(204).send()
      },
    )
}
