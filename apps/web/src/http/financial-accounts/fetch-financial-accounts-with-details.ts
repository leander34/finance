import { api } from '@/http/api-client'

interface FetchFinancialAccountsWithDetailsHttpRequest {
  slug: string
  page: number
  month: number
  year: number
}
export interface FetchFinancialAccountsWithDetailsHttpResponse {
  amountOfFinancialAccounts: number
  amountOfPages: number
  financialAccounts: {
    id: string
    organizationId: string
    name: string
    color: string
    amountOfCreditCards: number
    amountOfTransactions: number
    accountType: 'CC' | 'CI' | 'CP' | 'OUTROS' | 'DINHEIRO'
    bank: {
      id: string
      name: string
      imageUrl: string
    }
    archivedAt: string | null
    blockedByExpiredSubscription: boolean
    description: string | null
    createdAt: string
    initialBalance: number
    user: {
      id: string
      name: string
      email: string
    }
    visibledInOverallBalance: boolean
    expectedExpensesValue: number
    expectedRevenuesValue: number
    expectedMonthlyBalance: number
    currentBankBalance: number
    expectedBankBalanceAtTheEndOftheMonth: number
    bankBalanceAtTheEndOfTheMonth: number
  }[]
}

// usar cache
export async function fetchFinancialAccountsWithDetailsHttp({
  slug,
  page,
  month,
  year,
}: FetchFinancialAccountsWithDetailsHttpRequest) {
  const result = await api
    .post(`organizations/${slug}/financial-accounts/details`, {
      json: {
        page,
        month,
        year,
      },
    })
    .json<FetchFinancialAccountsWithDetailsHttpResponse>()
  return result
}
