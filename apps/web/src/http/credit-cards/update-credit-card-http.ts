import { api } from '@/http/api-client'

export interface UpdateCreditCardHttpRequest {
  slug: string
  creditCardId: string
  name: string
  limit: number
  flag: 'MCC' | 'VCC' | 'HCC' | 'ECC' | 'ACC' | 'OUTROS'
  invoiceClosingDate: number
  invoiceDueDate: number
  financialAccountId: string
  color: string
}

export async function updateCreditCardHttp({
  slug,
  creditCardId,
  ...data
}: UpdateCreditCardHttpRequest) {
  const result = await api.put(
    `organizations/${slug}/credit-cards/${creditCardId}`,
    {
      json: data,
    },
  )
  return result
}
