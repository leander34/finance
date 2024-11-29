import { api } from '@/http/api-client'

interface GetRevenueCategoriesResponse {
  categories: {
    id: string
    name: string
    color: string
    icon: string
  }[]
}

// usar cache
export async function getRevenueCategoriesHttp(slug: string) {
  const result = await api
    .get(`organizations/${slug}/categories/revenue`)
    .json<GetRevenueCategoriesResponse>()
  return result
}
