import './instrument'
import '../../application/schedules/recurrence'
import '../../application/schedules/future-transactions'

import { env } from '@saas/env'

import { app } from './app'

app
  .listen({
    port: 3333,
  })
  .then(() => console.log(`HTTP server is running at PORT: ${env.SERVER_PORT}`))
