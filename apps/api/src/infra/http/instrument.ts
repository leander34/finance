import { env } from '@saas/env'
import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

Sentry.init({
  dsn: 'https://ed1f624a7420aa5a0dffa216c563d7ec@o4507612138307584.ingest.us.sentry.io/4507612144205824',
  integrations: [nodeProfilingIntegration()],
  environment: env.NODE_ENV,
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions

  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
})
