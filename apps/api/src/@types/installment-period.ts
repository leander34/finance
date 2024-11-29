import { z } from 'zod'
export const installmentPeriodSchema = z.union([
  z.literal('anos'),
  z.literal('semestres'),
  z.literal('trimestres'),
  z.literal('bimestres'),
  z.literal('meses'),
  z.literal('quinzenas'),
  z.literal('semanas'),
  z.literal('dias'),
])

export type InstallmentPeriod = z.infer<typeof installmentPeriodSchema>
