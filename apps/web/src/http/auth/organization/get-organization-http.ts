import { api } from '@/http/api-client'

interface GetOrganizationResponse {
  organization: {
    type: 'PERSONAL'
    name: string
    id: string
    ownerId: string
    slug: string
    avatarUrl: string | null
    createdAt: string
    updatedAt: string
    deletedAt: string | null
  }
}

export async function getOrganizationHttp(
  slug: string,
): Promise<GetOrganizationResponse> {
  const result = await api
    .get(`organizations/${slug}`)
    .json<GetOrganizationResponse>()
  return result
}
