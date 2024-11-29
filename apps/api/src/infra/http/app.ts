import fastifyCors from '@fastify/cors'
import formbody from '@fastify/formbody'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { env } from '@saas/env'
import * as Sentry from '@sentry/node'
import fastify, { type FastifyInstance } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { errorHandler } from './error-handler'
import { loggerService } from './middlewares/logger'
import { rawBodyPlugin } from './plugins'
import { authRoutes } from './routes/auth/routes'
import { balanceRoutes } from './routes/balance/routes'
import { banksRoutes } from './routes/bank/routes'
import { categoriesRoutes } from './routes/categories/routes'
import { creditCardsRoutes } from './routes/credit-card/routes'
import { financialAccountsRoutes } from './routes/financial-account/routes'
import { organizationsRoutes } from './routes/organizations/routes'
import { stripeRoutes } from './routes/stripe/routes'
import { tagsRoutes } from './routes/tags/routes'
import { transactionsRoutes } from './routes/transactions/routes'
import { userRoutes } from './routes/user/routes'
import { whatsappRoutes } from './routes/whatsapp/routes'
// configurar:
// jwt
// cors
// files
// typeprovider
// swager

export class App {
  private _app: FastifyInstance
  constructor() {
    this._app = fastify().withTypeProvider<ZodTypeProvider>()
    this.configs()
    this.middlewares()
    this.routes()
    this.errorHandler()
  }

  get app() {
    return this._app
  }

  configs() {
    this._app.register(rawBodyPlugin)
    this._app.register(fastifyCors)
    this._app.register(fastifyJwt, {
      secret: env.JWT_SECRET,
    })
    this._app.register(formbody)
    this._app.setSerializerCompiler(serializerCompiler)
    this._app.setValidatorCompiler(validatorCompiler)
    this._app.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'Invezto API',
          description: 'Controle suas finanças com nosso app',
          version: '1.0.0',
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
      transform: jsonSchemaTransform,
    })
  }

  middlewares() {
    this._app.register(loggerService)
  }

  routes() {
    this._app.register(fastifySwaggerUI, {
      routePrefix: '/docs',
    })
    this._app.register(authRoutes)
    this._app.register(userRoutes)
    this._app.register(organizationsRoutes)
    this._app.register(financialAccountsRoutes)
    this._app.register(creditCardsRoutes)
    this._app.register(transactionsRoutes)
    this._app.register(balanceRoutes)
    this._app.register(categoriesRoutes)
    this._app.register(tagsRoutes)
    this._app.register(stripeRoutes)
    this._app.register(banksRoutes)
    this._app.register(whatsappRoutes)
  }

  // webhooks() {

  // }

  errorHandler() {
    Sentry.setupFastifyErrorHandler(this._app)
    this._app.setErrorHandler(errorHandler)
  }
}

export const app = new App().app
