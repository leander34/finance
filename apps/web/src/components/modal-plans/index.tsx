'use client'
import { RocketIcon, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import qs from 'query-string'
import { createContext, type ReactNode, use, useState } from 'react'
import { flushSync } from 'react-dom'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuth } from '@/providers/auth-provider'

import { DifferenceBetweenPlansTable } from '../difference-between-plans-table'
import { Badge } from '../ui/badge'
import { Icons } from '../ui/icons'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './dialog'
import { PlanCard } from './plan-card'
type ModalPlansContextType = {
  handleToggleModalPlans(): void
  changeShowAlert(): void
  showAlert: boolean
}
const ModalPlansContext = createContext<ModalPlansContextType | null>(null)

interface ModalPlansProps {
  children: ReactNode
}
export function ModalPlans({ children }: ModalPlansProps) {
  const { user, isAuthPending } = useAuth()
  const [showAlert, setShowAlert] = useState(false)
  const searchParams = useSearchParams()
  const isModalOpen = searchParams.get('modal-planos') === 'open'

  function getCurrentActivePlan() {
    if (user && user.subscription.currentPlan === 'FREE_PREMIUM') {
      return <Badge variant="plan">Premium Gratuido</Badge>
    }

    if (user && user.subscription.currentPlan === 'MONTHLY_PREMIUM') {
      return <Badge variant="plan">Premium mensal</Badge>
    }

    if (user && user.subscription.currentPlan === 'YEARLY_PREMIUM') {
      return <Badge variant="plan">Premium anual</Badge>
    }

    if (user && user.subscription.currentPlan === 'FREE') {
      return <Badge variant="plan">Gratuido</Badge>
    }
  }

  function changeShowAlert() {
    flushSync(() => {
      setShowAlert(true)
    })
  }

  function handleToggleModalPlans() {
    const currentUrl = window.location.href.split('?')[0]
    const currentQuery = qs.parse(window.location.search)
    const updatedQuery = {
      ...currentQuery,
    }
    if (isModalOpen) {
      delete updatedQuery['modal-planos']
      // setShowAlert(false)
    } else {
      updatedQuery['modal-planos'] = 'open'
    }
    const newUrl = qs.stringifyUrl(
      {
        url: currentUrl,
        query: updatedQuery,
      },
      { skipNull: true, sort: false },
    )

    window.history.pushState({}, '', newUrl)
  }

  const isFreePlan = !user || user.subscription.resolvedActivePlan === 'FREE'
  return (
    <ModalPlansContext.Provider
      value={{ changeShowAlert, handleToggleModalPlans, showAlert }}
    >
      {children}
      <Dialog open={isModalOpen} onOpenChange={handleToggleModalPlans}>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>Encontre o melhor plano para você</DialogTitle>
            <DialogDescription>
              <span className="italic">
                "Você deve ganhar controle sobre seu dinheiro ou a falta dele
                controlará você."
              </span>{' '}
              – <span className="font-medium">Dave Ramsey</span>
            </DialogDescription>
          </DialogHeader>
          {isAuthPending ? (
            <div className="flex h-[300px] items-center justify-center">
              <Icons.spinner className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="h-fit max-h-[400px] overflow-y-auto lg:max-h-[700px]">
              <div className="h-fit space-y-8">
                {showAlert && isFreePlan && (
                  <Alert variant="destructive">
                    <X className="h-4 w-4" />
                    <AlertTitle>
                      Funcionalidade indisponível no plano Free.
                    </AlertTitle>
                    <AlertDescription>
                      Esse funcionalidade só está disponivel no plano Premium.
                      Assine agora mesmo!
                    </AlertDescription>
                  </Alert>
                )}
                {isFreePlan ? (
                  <div className="flex justify-center gap-10">
                    <PlanCard
                      plan="MONTHLY_PREMIUM"
                      name="Premium"
                      type="mensal"
                      price="11,90"
                      info="Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat."
                      buyText="Escolher esse plano"
                      // buyText="Ir para o checkout"
                      // buyText="Selecionar"
                      // buyText="Quero esse!"
                      // buyText="Atualizar para Premium"
                      variant="outline"
                    />
                    <PlanCard
                      plan="YEARLY_PREMIUM"
                      name="Premium"
                      type="anual"
                      price="109,90"
                      mostPopular
                      discountText="20% de desconto"
                      info="Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat."
                      buyText="Escolher esse plano"
                    />
                  </div>
                ) : (
                  <div className="flex justify-center gap-10">
                    <Alert>
                      <RocketIcon className="h-4 w-4" />
                      <AlertTitle>Plano atual:</AlertTitle>
                      <AlertDescription>
                        Seu plano atual é o {getCurrentActivePlan()}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
                <div>
                  <DifferenceBetweenPlansTable />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ModalPlansContext.Provider>
  )
}

export function useModalPlans() {
  const context = use(ModalPlansContext)
  if (context === null) {
    throw new Error('useModalPlans can only be used inside a ModalPlansContext')
  }
  return context
}
