'use client'
import Link from 'next/link'
import type { ComponentProps } from 'react'

import { useCookies } from '@/hooks/use-cookies'

interface LinkWithSlugProps extends ComponentProps<typeof Link> {}
export function LinkWithSlug({ href, ...props }: LinkWithSlugProps) {
  const { currentOrg } = useCookies()
  return <Link href={`/o/${currentOrg}${href}`} {...props} />
}
