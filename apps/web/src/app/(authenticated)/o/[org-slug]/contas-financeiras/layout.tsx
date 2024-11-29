import { type ReactNode } from 'react'

import { Heading } from '@/components/global/heading'
import { PageContentContainer } from '@/components/global/page-content-container'

import { MonthPickerWrapper } from '../../../../../components/global/month-picker-wrapper'
import { FinancialAccountModalWrapper } from './_components/financial-account-modal-wrapper'
import { TabsAccounts } from './_components/tabs'
interface ContasFinanceirasLayoutProps {
  children: ReactNode
}
export default function ContasFinanceirasLayout({
  children,
}: ContasFinanceirasLayoutProps) {
  return (
    <PageContentContainer>
      <div className="flex items-center justify-between">
        <Heading.Root>
          <Heading.Title>Contas</Heading.Title>
          <Heading.Description>
            Crie, gerencie e obtenha insights sobre suas contas
          </Heading.Description>
        </Heading.Root>
        <div className="flex items-center gap-4">
          <MonthPickerWrapper />
          <FinancialAccountModalWrapper />
        </div>
      </div>
      <div>
        <TabsAccounts />
      </div>
      {children}
    </PageContentContainer>
  )
}
