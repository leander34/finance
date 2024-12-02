import 'dotenv/config'
import './instrument'
import '../../application/schedules/recurrence'
import '../../application/schedules/future-transactions'

import { env } from '@saas/env'

import { app } from './app'
// const envFile = `.env.${process.env.NODE_ENV || 'production'}`
// dotenv.config({ path: envFile })
console.log(env)

app
  .listen({
    port: env.PORT,
    host: '0.0.0.0',
  })
  .then(() => console.log(`HTTP server is running at PORT: ${env.PORT}`))
