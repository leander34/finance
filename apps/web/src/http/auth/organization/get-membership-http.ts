import { api } from '@/http/api-client'

interface GetMembershipResponse {
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

export async function getMembershipHttp(
  slug: string,
): Promise<GetMembershipResponse> {
  const result = await api
    .get(`organizations/${slug}`)
    .json<GetMembershipResponse>()
  return result
}
