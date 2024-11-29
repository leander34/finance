import { api } from '@/http/api-client'

export interface GetRevenueTagsResponse {
  tags: {
    id: string
    name: string
    color: string
  }[]
}

export async function getRevenueTagsHttp(slug: string) {
  const result = await api
    .get(`organizations/${slug}/tags/revenue`)
    .json<GetRevenueTagsResponse>()
  return result
}
