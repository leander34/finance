import { BadRequestError } from '@saas/core'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'
import { getUserDeviceInfo } from '../../middlewares/get-user-device-info'

export async function createTag(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(getUserDeviceInfo)
    .post(
      '/organizations/:slug/tags',
      {
        schema: {
          tags: ['Tags'],
          summary: 'Create a tag.',
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
          }),
          body: z.object({
            name: z.string({ required_error: 'Nome da tag é obrigatório.' }),
            color: z
              .string()
              .nullish()
              .transform((value) => {
                if (!value) {
                  return '#333'
                }
                return value
              }),
            // type: z.nativeEnum(TagType),
          }),
          response: {
            200: z.object({
              tag: z.object({
                id: z.string().uuid().nullable(),
                name: z.string(),
                color: z.string(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { slug } = request.params
        const { organization } = await request.getUserMembership(slug)
        const { name, color } = request.body

        const tagByName = await prisma.tag.findUnique({
          where: {
            name_organizationId: {
              name,
              organizationId: organization.id,
            },
          },
        })

        if (tagByName) {
          throw new BadRequestError(
            'pt-br.tags.a-tag-with-that-name-already-exists',
          )
        }

        const tag = await prisma.tag.create({
          data: {
            userId,
            organizationId: organization.id,
            name,
            color,
          },
          select: {
            id: true,
            name: true,
            color: true,
          },
        })

        return reply.status(200).send({
          tag,
        })
      },
    )
}
