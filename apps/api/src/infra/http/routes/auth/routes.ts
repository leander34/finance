import type { FastifyInstance } from 'fastify'

import { forgotPassword } from './forgot-password'
import { passwordReset } from './password-reset'
import { signInWithPassword } from './sign-in-with-password'
import { signUpWithPassword } from './sign-up-with-password'
import { verifyEmail } from './verify-email'

export async function authRoutes(app: FastifyInstance) {
  app.register(signUpWithPassword)
  app.register(signInWithPassword)
  app.register(forgotPassword)
  app.register(passwordReset)
  app.register(verifyEmail)
}
