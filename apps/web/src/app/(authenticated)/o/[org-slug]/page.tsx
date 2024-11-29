import { redirect } from 'next/navigation'

import { getCurrentOrganizationSlug } from '@/auth/session-server-only'
// interface OrgSlugPageProps {
//   params: {
//     'org-slug': string
//   }
// }

export default function OrgSlugPage() {
  const orgSlug = getCurrentOrganizationSlug()
  // p/org-slug/dashboard
  redirect(`/o/${orgSlug}/dashboard`)
}
