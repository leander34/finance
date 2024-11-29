import { OrganizationType, TokenType } from '@prisma/client'
import {
  BadRequestError,
  categories,
  createSlug,
  dayjs,
  getPlanByStripeId,
  phoneValidator,
  PLAN_NAMES,
  randomNumber,
  RESOLVED_PLAN_NAMES,
  SUBSCRIPTION_TYPE,
} from '@saas/core'
import bcrypt from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { createOrGetCustumerAndAddFreeSubscription } from '@/application/stripe'
import { prisma } from '@/infra/database/prisma'

import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'
export async function signUpWithPassword(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(getUserDeviceInfo)
    .post(
      '/sign-up',
      {
        schema: {
          tags: ['Auth'],
          summary: 'Sign up with e-mail and password.',
          // security: [{ bearerAuth: [] }],
          body: z.object({
            name: z
              .string({ required_error: 'O campo nome é obrigatório.' })
              .refine((value) => value.trim().split(' ').length >= 2, {
                message: 'Digite o seu nome completo.',
              }),
            phone: z
              .string({
                required_error: 'O campo número do telefone é obrigatório.',
              })
              .refine((value) => phoneValidator(value), {
                message: 'Número de telefone inválido.',
              }),
            email: z
              .string({ required_error: 'O campo e-mail é obrigatório.' })
              .email({ message: 'E-mail inválido.' }),
            password: z
              .string({ required_error: 'O campo senha é obrigatório.' })
              .min(6, {
                message:
                  'Senha inválida. Sua senha deve conter pelo menos 6 caracteres.',
              }),
            // document: z
            //   .string({ required_error: 'O campo CPF/CNPJ é obrigatório.' })
            //   .min(11, { message: 'Documento inválido.' })
            //   .max(11, { message: 'Documento inválido.' })
            //   .refine((value) => documentValidator(value), {
            //     message: 'Documento inválido.',
            //   }),
          }),
          response: {
            201: z.object({
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
        const { device, location } = await request.getUserDeviceInfo()
        const { name, email, password, phone } = request.body

        const userByEmail = await prisma.user.findUnique({
          where: {
            email,
          },
        })

        if (userByEmail) {
          throw new BadRequestError(
            'pt-br.user.user-with-same-email-already-exists',
          )
        }

        // const userByDocument = await prisma.user.findUnique({
        //   where: {
        //     document,
        //   },
        // })

        // if (userByDocument) {
        //   throw new BadRequestError(
        //     'pt-br.user.user-with-same-document-already-exists',
        //   )
        // }

        const internationalPhone = `55${phone}`

        const userByPhone = await prisma.user.findUnique({
          where: {
            phone: internationalPhone,
          },
        })

        if (userByPhone) {
          throw new BadRequestError(
            'pt-br.user.user-with-same-phone-already-exists',
          )
        }

        const passwordHash = await bcrypt.hash(password, 10)

        try {
          const {
            stripeCustomerId,
            stripeSubscriptionId,
            stripeSubscriptionStatus,
            stripePriceId,
            stripeProductId,
            stripeStartDate,
            stripeCurrentPeriodStart,
            stripeCurrentPeriodEnd,
            stripeDaysUntilDue,
            stripeEndedAt,
            stripeCancelAt,
            stripeCancelAtPeriodEnd,
            stripeCanceledAt,
            stripeDiscountCouponId,
            stripeTrialStart,
            stripeTrialEnd,
          } = await createOrGetCustumerAndAddFreeSubscription({
            name,
            email,
          })

          const plan = getPlanByStripeId(stripePriceId)
          const planName = plan?.name ?? PLAN_NAMES.FREE
          const resolvedPlan = plan?.resolvendPlan ?? RESOLVED_PLAN_NAMES.FREE
          const subscriptionType =
            plan?.subscriptionType ?? SUBSCRIPTION_TYPE.MONTHLY

          const userPrisma = await prisma.user.create({
            select: {
              id: true,
              tokens: {
                select: {
                  id: true,
                },
              },
            },
            data: {
              stripeCustomerId,
              name,
              email,
              phone: internationalPhone,
              // document,
              password: passwordHash,
              firstLogin: true,
              firstLoginToday: true,
              tokens: {
                create: {
                  type: TokenType.EMAIL_VERIFY,
                  expiresIn: dayjs().add(30, 'day').unix(),
                },
              },
              subscription: {
                create: {
                  plan: planName,
                  type: subscriptionType,
                  resolvedPlan,
                  startDate: stripeStartDate,
                  currentPeriodStart: stripeCurrentPeriodStart,
                  currentPeriodEnd: stripeCurrentPeriodEnd,
                  status: stripeSubscriptionStatus,
                  stripeSubscriptionId,
                  stripePriceId,
                  stripeProductId: stripeProductId.toString(),
                  endedAt: stripeEndedAt,
                  stripeDaysUntilDue,
                  cancelAtPeriodEnd: stripeCancelAtPeriodEnd,
                  cancelAt: stripeCancelAt,
                  canceledAt: stripeCanceledAt,
                  stripeDiscountCouponId,
                  trialStart: stripeTrialStart,
                  trialEnd: stripeTrialEnd,
                },
              },
              activitiesHistory: {
                create: {
                  activityType: 'SIGN_UP',
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
            },
          })

          const organization = await prisma.organization.create({
            select: {
              id: true,
              slug: true,
              type: true,
            },
            data: {
              ownerId: userPrisma.id,
              name: `${name} pessoal`,
              slug: `${createSlug(`${name}-${randomNumber()}`)}`,
              members: {
                create: {
                  role: 'ADMIN',
                  userId: userPrisma.id,
                },
              },
            },
          })

          // criar um conta padrao

          const wallet = await prisma.bank.findUnique({
            where: {
              name: 'Carteira',
            },
          })

          await prisma.financialAccount.create({
            data: {
              name: 'Carteira',
              color: '#333',
              initialBalance: 0,
              accountIntegrationType: 'MANUAL',
              accountType: 'DINHEIRO',
              bankId: wallet?.id ?? '',
              organizationId: organization.id,
              userId: userPrisma.id,
              isWallet: true,
            },
          })

          const categoriesPrisma = categories.map((category) => {
            return prisma.category.create({
              data: {
                name: category.name,
                color: category.color,
                icon: category.icon,
                type: category.type,
                mainCategory: category.mainCategory,
                organizationId: organization.id,
                userId: userPrisma.id,
                subcategories: {
                  createMany: {
                    data: category.subcategories.map((subcategory) => ({
                      name: subcategory.name,
                      color: subcategory.color,
                      type: subcategory.type,
                      mainSubcategory: subcategory.mainSubcategory,
                      organizationId: organization.id,
                      userId: userPrisma.id,
                    })),
                  },
                },
              },
            })
          })

          await Promise.all(categoriesPrisma)

          // mandar um email para o usuário verificar sua conta
          const verifyEmailToken = userPrisma.tokens[0].id
          console.log(verifyEmailToken)

          const token = await reply.jwtSign(
            {},
            {
              sign: {
                sub: userPrisma.id,
                expiresIn: 1000 * 60 * 60 * 24 * 7, // 7 dias
              },
            },
          )
          return reply.status(200).send({
            accessToken: token,
            organization: {
              slug: organization.slug,
              type: organization.type,
            },
          })
        } catch (error) {
          throw new BadRequestError('pt-br.user.unable-to-create-account')
        }
      },
    )
}
