import { env } from '@saas/env'
import twilio from 'twilio'
export const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
