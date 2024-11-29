import { api } from '@/http/api-client'

interface GetExpenseCategoriesResponse {
  categories: {
    id: string
    name: string
    color: string
    icon: string
    type: 'EXPENSE' | 'REVENUE'
  }[]
}

// usar cache
export async function getExpenseCategoriesHttp(slug: string) {
  const result = await api
    .get(`organizations/${slug}/categories/expense`)
    .json<GetExpenseCategoriesResponse>()
  return result
}
