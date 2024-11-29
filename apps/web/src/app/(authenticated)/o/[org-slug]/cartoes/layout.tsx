import { type ReactNode } from 'react'

import { Heading } from '@/components/global/heading'
import { MonthPickerWrapper } from '@/components/global/month-picker-wrapper'
import { PageContentContainer } from '@/components/global/page-content-container'

import { CreditCardModalWrapper } from './_components/credit-card-modal-wrapper'
import { TabsCreditCard } from './_components/tabs'

// import { FinancialAccountModalWrapper } from './_components/financial-account-modal-wrapper'
// import { MonthPickerWrapper } from './_components/month-picker-wrapper'
// import { TabsAccounts } from './_components/tabs'
interface CartoesLayoutProps {
  children: ReactNode
}
export default function CartoesLayout({ children }: CartoesLayoutProps) {
  return (
    <PageContentContainer>
      <div className="flex items-center justify-between">
        <Heading.Root>
          <Heading.Title>Cartões de crédito</Heading.Title>
          <Heading.Description>
            Crie, gerencie e obtenha insights sobre seus cartões de crédito
          </Heading.Description>
        </Heading.Root>
        <div className="flex items-center gap-4">
          <MonthPickerWrapper />
          <CreditCardModalWrapper />
        </div>
      </div>
      <div>
        <TabsCreditCard />
      </div>
      {children}
    </PageContentContainer>
  )
}
