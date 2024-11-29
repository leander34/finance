import { api } from '../api-client'
interface SignUpHttpRequest {
  name: string
  // document: string
  email: string
  phone: string
  password: string
}

export interface SignUpHttpResponse {
  accessToken: string
  organization: {
    slug: string
    type: 'PERSONAL'
  }
}

export async function signUpHttp({
  name,
  email,
  password,
  phone,
}: SignUpHttpRequest) {
  const response = await api
    .post('sign-up', {
      json: {
        name,
        email,
        password,
        phone,
      },
    })
    .json<SignUpHttpResponse>()
  return response
}
