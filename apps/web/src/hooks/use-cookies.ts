import { getCookies } from 'cookies-next'
export function useCookies() {
  const { access_token: token, organization } = getCookies()
  return {
    currentOrg: organization,
    token,
  }
}
