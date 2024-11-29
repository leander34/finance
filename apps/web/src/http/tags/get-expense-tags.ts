import { api } from '@/http/api-client'

export interface GetExpenseTagsResponse {
  tags: {
    id: string
    name: string
    color: string
  }[]
}

export async function getExpenseTagsHttp(slug: string) {
  const result = await api
    .get(`organizations/${slug}/tags/expense`)
    .json<GetExpenseTagsResponse>()
  return result
}
