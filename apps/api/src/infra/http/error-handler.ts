import { normalizeError } from '@saas/core'
import { env } from '@saas/env'
import * as Sentry from '@sentry/node'
import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error',
      errors: error.flatten().fieldErrors,
    })
  }
  const normalizedError = normalizeError(error)

  const httpCode = normalizedError.httpCode
  const body = normalizedError.getBody()

  if (env.NODE_ENV === 'production') {
    console.error(error)
    Sentry.captureException(error)
  } else {
    // console.log(request.body)
    // logger
    console.error(error)
  }

  return reply.status(httpCode).send(body)
}
