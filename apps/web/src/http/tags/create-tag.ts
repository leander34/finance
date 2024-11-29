import { api } from '@/http/api-client'

interface CreateTagRequest {
  slug: string
  name: string
  // type: 'EXPENSE' | 'REVENUE'
  color: string | null | undefined
}

interface CreateTagResponse {
  tag: {
    id: string
    name: string
    color: string
  }
}

export async function createTagHttp({ slug, name, color }: CreateTagRequest) {
  const result = await api
    .post(`organizations/${slug}/tags`, {
      json: {
        name,
        color,
      },
    })
    .json<CreateTagResponse>()

  return result
}
