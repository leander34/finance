import { api } from '@/http/api-client'

export interface CreateCreditCardHttpRequest {
  slug: string
  name: string
  limit: number
  flag: 'MCC' | 'VCC' | 'HCC' | 'ECC' | 'ACC' | 'OUTROS'
  invoiceClosingDate: number
  invoiceDueDate: number
  financialAccountId: string
  color: string
}

export async function createCreditCardHttp({
  slug,
  ...data
}: CreateCreditCardHttpRequest) {
  const result = await api.post(`organizations/${slug}/credit-cards`, {
    json: data,
  })
  return result
}
