import { dayjs } from '@saas/core'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function verifyEmail(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(getUserDeviceInfo)
    .post(
      '/users/verify-email',
      {
        schema: {
          tags: ['Auth'],
          summary: 'Verify user e-mail.',
          body: z.object({
            code: z.string().uuid({ message: 'Código inválido.' }),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { device, location } = await request.getUserDeviceInfo()
        const { code } = request.body

        // logar a chama dessa rota

        const emailVerifyToken = await prisma.token.findUnique({
          where: {
            type: 'EMAIL_VERIFY',
            id: code,
          },
        })

        if (!emailVerifyToken) {
          // loggar tentativa de validar e-mail com token inválido
          throw new Error()
        }

        const user = await prisma.user.findUnique({
          where: {
            id: emailVerifyToken.userId,
          },
        })

        if (!user) {
          throw new Error('')
        }

        if (user.emailVerifiedAt) {
          throw new Error('E-mail já verificado.')
        }

        if (emailVerifyToken.disabled) {
          throw new Error()
        }

        const isTokenExpired = dayjs
          .unix(emailVerifyToken.expiresIn)
          .isBefore(dayjs())

        if (isTokenExpired) {
          throw new Error()
        }

        await prisma.user.update({
          where: {
            id: emailVerifyToken.userId,
          },
          data: {
            emailVerifiedAt: dayjs().toDate(),
            activitiesHistory: {
              create: {
                activityType: 'VERIFY_EMAIL',
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
                  id: emailVerifyToken.id,
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
