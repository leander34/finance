import { z } from 'zod'
export const invoiceStatusSchema = z.union([
  z.literal('OPEN'),
  z.literal('CLOSED'),
  z.literal('PAST_DUE_DATE'),
  z.literal('NOT_OPEN'),
])
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>

export const invoicePaymentStatusSchema = z.union([
  z.literal('FULLY_PAID'),
  z.literal('PARTIALLY_PAID'),
  z.literal('UNPAID'),
  z.null(),
])
export type InvoicePaymentStatus = z.infer<typeof invoicePaymentStatusSchema>
