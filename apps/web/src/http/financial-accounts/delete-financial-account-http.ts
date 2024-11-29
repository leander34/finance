import { api } from '@/http/api-client'

export interface DeleteFinancialAccountHttpRequest {
  slug: string
  financialAccountId: string
}

export async function deleteFinancialAccountHttp({
  slug,
  financialAccountId,
}: DeleteFinancialAccountHttpRequest) {
  const result = await api.delete(
    `organizations/${slug}/financial-accounts/${financialAccountId}`,
  )
  return result
}
