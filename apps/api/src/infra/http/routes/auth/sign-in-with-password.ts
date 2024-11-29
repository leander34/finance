import { OrganizationType } from '@prisma/client'
import { BadRequestError, ResourceNotFoundError } from '@saas/core'
import bcrypt from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

// import { LoggerService } from '@/application/service/logger-service'
import { prisma } from '@/infra/database/prisma'

// import { logger } from '@/utils/logger'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function signInWithPassword(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(getUserDeviceInfo)
    .post(
      '/sessions/password',
      {
        schema: {
          tags: ['Auth'],
          summary: 'Sign in with e-mail and password.',
          body: z.object({
            email: z
              .string({ required_error: 'O campo e-mail é obrigatório.' })
              .email({ message: 'E-mail inválido.' }),
            password: z
              .string({ required_error: 'O campo senha é obrigatório.' })
              .min(6, { message: 'Senha inválida.' }),
          }),
          response: {
            200: z.object({
              accessToken: z.string(),
              organization: z.object({
                slug: z.string(),
                type: z.nativeEnum(OrganizationType), // corrigir
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { email, password } = request.body
        // loggar que a rota foi chamada
        // request.loggerService.info('SIGN_IN', 'Tentativa de login', {
        //   input: {
        //     email,
        //   },
        // })

        let user = await prisma.user.findUnique({
          where: {
            email,
          },
          include: {
            ownsOrganizations: {
              select: {
                slug: true,
                type: true,
              },
              where: {
                type: 'PERSONAL',
              },
            },
          },
        })

        if (!user) {
          // tentativa de login de um usuário que não existe (warn)
          throw new ResourceNotFoundError('pt-br.user.wrong-credentials')
        }

        if (!user.password) {
          // tentativa de login de um usuário que criou a conta com um método social que não existe (warn)
          throw new BadRequestError('pt-br.user.user-without-password')
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (isPasswordValid === false) {
          // tentativa de login com erro de senha (warn)
          throw new BadRequestError('pt-br.user.wrong-credentials')
        }

        user = await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            firstLogin: false,
            firstLoginToday: false,
          },
          include: {
            ownsOrganizations: {
              select: {
                slug: true,
                type: true,
              },
              where: {
                type: 'PERSONAL',
              },
            },
          },
        })

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
            userId: user.id,
            activityType: 'SIGN_IN',
            deviceId: devicePrisma.id,
            locationId: locationPrisma ? locationPrisma.id : undefined,
          },
        })

        // login bem sucedido (info)

        const token = await reply.jwtSign(
          {},
          {
            sign: {
              sub: user.id,
              expiresIn: 1000 * 60 * 60 * 24 * 7, // 7 dias
            },
          },
        )
        return reply.status(200).send({
          accessToken: token,
          organization: {
            slug: user.ownsOrganizations[0].slug,
            type: user.ownsOrganizations[0].type,
          },
        })
      },
    )
}
