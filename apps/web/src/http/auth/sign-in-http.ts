import { api } from '../api-client'
interface SignInHttpRequest {
  email: string
  password: string
}

export interface SignInHttpResponse {
  accessToken: string
  organization: {
    slug: string
    type: 'PERSONAL'
  }
}

export async function signInHttp({ email, password }: SignInHttpRequest) {
  const response = await api
    .post('sessions/password', {
      json: {
        email,
        password,
      },
    })
    .json<SignInHttpResponse>()
  return response
}
