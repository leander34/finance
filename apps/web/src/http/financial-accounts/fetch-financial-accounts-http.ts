import { api } from '@/http/api-client'

interface FetchFinancialAccountsHttpRequest {
  slug: string
  includeWallet?: boolean
}
export interface FetchFinancialAccountsHttpResponse {
  financialAccounts: {
    id: string
    name: string
    color: string
    bank: {
      id: string
      name: string
      imageUrl: string
    }
  }[]
}

// usar cache
export async function fetchFinancialAccountsHttp({
  slug,
  includeWallet = false,
}: FetchFinancialAccountsHttpRequest) {
  const result = await api
    .post(`organizations/${slug}/financial-accounts/list`, {
      json: {
        includeWallet,
      },
    })
    .json<FetchFinancialAccountsHttpResponse>()
  return result
}
