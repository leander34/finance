import { api } from '@/http/api-client'

interface GetAccountsAndCreditCardsResponse {
  items: (
    | {
        financialAccountId: string
        creditCardId: null
        imageUrl: string
        name: string
        color: string
      }
    | {
        creditCardId: string
        financialAccountId: null
        imageUrl: string
        name: string
        color: string
      }
  )[]
}

// usar cache
export async function getAccountsAndCreditCardsHttp(slug: string) {
  const result = await api
    .get(`organizations/${slug}/accounts-and-credit-cards`)
    .json<GetAccountsAndCreditCardsResponse>()
  return result
}
