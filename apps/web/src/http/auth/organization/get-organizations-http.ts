import { api } from '@/http/api-client'

interface GetOrganizationsResponse {
  organizations: {
    id: string
    slug: string
    name: string
    avatarUrl: string | null
    role: 'ADMIN' | 'MEMBER' | 'BILLING'
    type: 'PERSONAL'
  }[]
}

// usar cache
export async function getOrganizationsHttp(): Promise<GetOrganizationsResponse> {
  const result = await api.get('organizations').json<GetOrganizationsResponse>()
  return result
}
