import { type ReactNode } from 'react'

import { SidebarNav } from './sidebar-nav'
// export const metadata: Metadata = {
//   title: 'Forms',
//   description: 'Advanced form example using react-hook-form and Zod.',
// }

interface LayoutConfiguracaoProps {
  children: ReactNode
}
export default function LayoutConfiguracao({
  children,
}: LayoutConfiguracaoProps) {
  return (
    <div className="hidden space-y-6 pb-16 md:block">
      {/* <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua conta.
        </p>
      </div>
      <Separator className="my-6" /> */}
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <SidebarNav />
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
