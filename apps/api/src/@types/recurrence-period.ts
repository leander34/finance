import { z } from 'zod'
export const recurrencePeriodSchema = z.union([
  z.literal('anual'),
  z.literal('semestral'),
  z.literal('trimestral'),
  z.literal('bimestral'),
  z.literal('mensal'),
  z.literal('quinzenal'),
  z.literal('semanal'),
  z.literal('diario'),
])

export type RecurrencePeriod = z.infer<typeof recurrencePeriodSchema>
