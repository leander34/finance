import { LockKeyhole } from 'lucide-react'
import { cookies } from 'next/headers'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { getCurrentOrganizationSlug } from '@/auth/session-server-only'
import { Header } from '@/components/header'
import { MenuSidebar } from '@/components/menu-sidebar'
import { ModalPlans } from '@/components/modal-plans'
import { NewTransactionSheet } from '@/components/new-transaction/new-transaction-sheet'
import { Button } from '@/components/ui/button'
import { getOrganizationsHttp } from '@/http/auth/organization/get-organizations-http'
import { getUserProfileHttp } from '@/http/auth/user/get-user-profile-http'

interface LayoutAppProps {
  children: ReactNode
}

export default async function LayoutOrganizationSlug({
  children,
}: LayoutAppProps) {
  const currentOrg = getCurrentOrganizationSlug()
  const { organizations } = await getOrganizationsHttp()
  const userHasAccessToThisOrganization = !!organizations.find(
    (organization) => organization.slug === currentOrg,
  )

  const collapsed = cookies().get('collapsed-menu-sidebar')
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined
  console.log(defaultCollapsed)

  const personalOrganization = organizations.find(
    (organization) => organization.type === 'PERSONAL',
  )
  const { user } = await getUserProfileHttp()
  const {
    subscription: { currentPlan, resolvedActivePlan },
  } = user

  if (!userHasAccessToThisOrganization) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex h-full max-h-80 flex-col justify-center space-y-6 rounded-lg border border-input p-4 shadow-md">
          <h1 className="max-w-sm text-balance text-center text-2xl font-medium text-foreground">
            Você não tem acesso a esta organização.
          </h1>
          <div className="flex items-center justify-center">
            <LockKeyhole className="text-amber-500" />
          </div>
          <div className="flex justify-center">
            {/* <p>Selecione uma organização que você</p> */}
            {/* <ChangeOrganization organizations={organizations} /> */}
            {personalOrganization && (
              <Button asChild>
                <Link href={`/o/${personalOrganization.slug}/dashboard`}>
                  Voltar para minha organização
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // mostrar texto falando que você não tem acesso a tal organization com um botão para retornar para alguma organização. (mostrar todas)

  return (
    // <div className="flex h-full bg-blue-500">
    <ModalPlans>
      <div className="flex h-screen max-h-screen min-h-screen overflow-hidden">
        <MenuSidebar
          resolvedActivePlan={resolvedActivePlan}
          currentPlan={currentPlan}
          defaultCollpsed={defaultCollapsed}
        />
        <div className="flex-1">
          <Header />
          <main className="h-[calc(100vh_-_var(--header-height))] max-h-[calc(100vh_-_var(--header-height))] overflow-auto p-4 px-8 py-8">
            {children}
            {/* <Button className="fixed bottom-5 right-5 flex h-12 w-12 rounded-full">
              <Plus className="size-6 shrink-0" />
            </Button> */}
          </main>
        </div>
      </div>
      <NewTransactionSheet />
    </ModalPlans>
  )
}
