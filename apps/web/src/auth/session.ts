// tomar cuidado para o pode ser importando no client e o que ser apenas importado no servidor

import { cookies } from 'next/headers'

export function hasAuthCookie() {
  return !!cookies().get('access_token')?.value
}

export function getOrganizationSlug() {
  const orgSlug = cookies().get('organization')?.value ?? null
  return orgSlug
}

// sem uso por enquanto
