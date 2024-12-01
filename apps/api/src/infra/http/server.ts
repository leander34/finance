import './instrument'
import '../../application/schedules/recurrence'
import '../../application/schedules/future-transactions'

import { env } from '@saas/env'

import { app } from './app'
// const envFile = `.env.${process.env.NODE_ENV || 'production'}`
// dotenv.config({ path: envFile })
// console.log(env.NODE_ENV)

app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => console.log(`HTTP server is running at PORT: ${env.PORT}`))
