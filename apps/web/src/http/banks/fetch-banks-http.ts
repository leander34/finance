import { api } from '../api-client'
export interface FetchBanksHttpResponse {
  banks: {
    id: string
    name: string
    imageUrl: string
    openFinanceIntegration: boolean
  }[]
}
export async function fetchBanksHttp() {
  const result = await api.get('banks').json<FetchBanksHttpResponse>()
  return result
}
