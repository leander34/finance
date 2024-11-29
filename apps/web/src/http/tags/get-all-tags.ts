import { api } from '@/http/api-client'

export interface GetAllTagsResponse {
  tags: {
    id: string
    name: string
    color: string
  }[]
}

export async function getAllTagsHttp(slug: string) {
  const result = await api
    .get(`organizations/${slug}/tags`)
    .json<GetAllTagsResponse>()
  return result
}
