import 'server-only'

import { env } from '@saas/env'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { getUserProfileHttp } from '@/http/auth/user/get-user-profile-http'

const secretKey = env.JWT_SECRET
const key = new TextEncoder().encode(secretKey)
export async function decrypt(accessToken: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(accessToken, key)
    return payload
  } catch (error) {
    return null
  }
}

export async function createSession(
  token: string,
  orgSlug: string,
  redirectUrl?: string,
) {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 dias

  cookies().set('access_token', token, {
    // httpOnly: true,
    // secure: true,
    expires: expiresAt,
    // sameSite: 'lax',
    path: '/',
  })

  cookies().set('organization', orgSlug, {
    // httpOnly: true,
    // secure: true,
    expires: expiresAt,
    // sameSite: 'lax',
    path: '/',
  })
  redirectUrl = redirectUrl || `/o/${orgSlug}/dashboard`
  redirect(redirectUrl)
}

export async function verifySession() {
  const cookie = cookies().get('access_token')?.value
  const session = await decrypt(cookie)

  if (!session) {
    cookies().delete('access_token')
    cookies().delete('organization')
    redirect('/sing-in')
  }

  return true
}

export async function getUserProfileServer() {
  // const token = cookies().get('token')?.value
  if (!(await verifySession())) {
    redirect('/sign-in')
  }

  try {
    const { user } = await getUserProfileHttp()
    return { user }
  } catch {}
  cookies().delete('access_token')
  cookies().delete('organization')
  redirect('/sign-in')
}

export function deleteSession() {
  cookies().delete('access_token')
  cookies().delete('organization')
  redirect('/sign-in')
}

export function getCurrentOrganizationSlug() {
  const orgSlug = cookies().get('organization')?.value ?? null
  return orgSlug
}

// getPermissions
// ability
// getMembership
// getOrganization
// getOrganizations
