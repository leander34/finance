import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'
export const env = createEnv({
  server: {
    PORT: z.coerce.number().default(3333),
    IPINFO_ACCESS_TOKEN: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_PUBLISHABLE_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    TWILIO_ACCOUNT_SID: z.string().min(1),
    TWILIO_AUTH_TOKEN: z.string().min(1),
    NODE_ENV: z
      .union([z.literal('development'), z.literal('production')])
      .default('development'),
  },
  client: {},
  shared: {
    JWT_SECRET: z.string().min(20),
    NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3333'),
    NEXT_PUBLIC_URL: z.string().url().default('http://localhost:3000'),
  },
  runtimeEnv: {
    PORT: process.env.PORT,
    IPINFO_ACCESS_TOKEN: process.env.IPINFO_ACCESS_TOKEN,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  },
  emptyStringAsUndefined: true,
})
