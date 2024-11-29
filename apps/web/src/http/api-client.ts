import { getCookie } from 'cookies-next'
import { type CookiesFn } from 'cookies-next/lib/types'
import ky from 'ky'
export const api = ky.create({
  prefixUrl: 'http://localhost:3333',
  // redirect: 'manual',
  hooks: {
    beforeRequest: [
      async (request) => {
        let cookieStore: CookiesFn | undefined
        if (typeof window === 'undefined') {
          const { cookies: serverCookies } = await import('next/headers')
          cookieStore = serverCookies
        }
        const token = getCookie('access_token', { cookies: cookieStore })
        // console.log(token)
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
  },
})
