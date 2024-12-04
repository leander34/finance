'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { X } from 'lucide-react'
import type { ComponentType, FC, ReactNode } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuth } from '@/providers/auth-provider'

import { useModalPlans } from '../modal-plans'

// import { useAuth } from '@/context/auth/auth-context'
export type PremiumComponentsProps = {
  componentAction: (p?: any) => void
}
export const premiumComponents = <P extends PremiumComponentsProps>(
  WrappedComponent: ComponentType<P>,
) => {
  const component: FC<P> = ({ componentAction, ...props }) => {
    const { handleToggleModalPlans, changeShowAlert } = useModalPlans()
    const { user, isAuthPending } = useAuth()
    // const { data, isLoading: isAuthPending } = useQuery({
    //   queryKey: ['user-profile'],
    //   queryFn: async () => {
    //     await fakeDelay(10000)
    //     console.log('terminout')
    //     return getUserProfileHttp()
    //   },
    // })

    const handleAction = () => {
      if (user === null) return
      if (user.subscription.resolvedActivePlan === 'FREE') {
        changeShowAlert()
        handleToggleModalPlans()
        return
      }
      // verificar se é premium
      componentAction()
    }

    return (
      <>
        <WrappedComponent
          {...(props as P)}
          componentAction={handleAction}
          isLoading={isAuthPending}
        />
      </>
    )
  }
  return component
}
interface PremiumContentProps {
  children: ReactNode
}
export function PremiumContent({ children }: PremiumContentProps) {
  const { user } = useAuth()

  if (!user || user.subscription.resolvedActivePlan === 'FREE') {
    return (
      <Alert variant="destructive">
        <X className="h-4 w-4" />
        <AlertTitle>Funcionalidade indisponível no plano Free.</AlertTitle>
        <AlertDescription>
          Esse funcionalidade só está disponivel no plano Premium. Assine agora
          mesmo!
        </AlertDescription>
      </Alert>
    )
  }
  return <>{children}</>
}
