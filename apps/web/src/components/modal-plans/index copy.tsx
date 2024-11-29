'use client'
import { fakeDelay } from '@saas/core'
import { useQuery } from '@tanstack/react-query'
import {
  CircleCheck,
  CircleCheckBig,
  CircleX,
  Info,
  RocketIcon,
  X,
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import qs from 'query-string'
import { useState } from 'react'
import { flushSync } from 'react-dom'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getUserProfileHttp } from '@/http/auth/user/get-user-profile-http'
import { functionalities } from '@/plan/functionalities'

import { Badge } from '../ui/badge'
import { Icons } from '../ui/icons'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog'
import { PlanCard } from './plan-card'
export function useModalPlans() {
  const [showAlert, setShowAlert] = useState(false)
  const searchParams = useSearchParams()
  const isModalOpen = searchParams.get('modal-planos') === 'open'
  function changeShowAlert() {
    flushSync(() => {
      setShowAlert(!showAlert)
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
  return {
    isModalOpen,
    handleToggleModalPlans,
    showAlert,
    changeShowAlert,
  }
}

export function ModalPlans() {
  const { isModalOpen, handleToggleModalPlans, showAlert } = useModalPlans()
  const { data, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      // await fakeDelay(2000)
      return getUserProfileHttp()
    },
    enabled: isModalOpen,
  })

  function getCurrentActivePlan() {
    if (data && data.user.subscription.currentPlan === 'FREE_PREMIUM') {
      return <Badge variant="plan">Premium Gratuido</Badge>
    }

    if (data && data.user.subscription.currentPlan === 'MONTHLY_PREMIUM') {
      return <Badge variant="plan">Premium mensal</Badge>
    }

    if (data && data.user.subscription.currentPlan === 'YEARLY_PREMIUM') {
      return <Badge variant="plan">Premium anual</Badge>
    }

    if (data && data.user.subscription.currentPlan === 'FREE') {
      return <Badge variant="plan">Gratuido</Badge>
    }
  }

  const isFreePlan =
    data && data.user.subscription.resolvedActivePlan === 'FREE'
  console.log('showAlert')
  console.log(showAlert)
  return (
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
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <Icons.spinner className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="h-fit max-h-[400px] overflow-y-auto lg:max-h-[700px]">
            <div className="h-fit space-y-8">
              {showAlert && (
                <Alert variant="destructive">
                  <X className="h-4 w-4" />
                  <AlertTitle>
                    Funcionalidade indisponível no plano Free
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
                <Table>
                  <TableCaption>
                    Lista de funcionalidades por plano.
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">
                        Funcionalidades
                      </TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                      <TableHead className="text-center">Free (R$ 0)</TableHead>
                      <TableHead className="text-center">
                        Premium mensal (R$ 11,90/mês)
                      </TableHead>
                      <TableHead className="text-center">
                        Premium anual (R$ 109,90/ano)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {functionalities.map((functionality) => {
                      return (
                        <TableRow key={functionality.name}>
                          <TableCell className="font-medium">
                            {functionality.name}
                          </TableCell>
                          <TableCell className="font-medium">
                            <TooltipProvider>
                              <Tooltip
                                delayDuration={0}
                                disableHoverableContent
                              >
                                <TooltipTrigger asChild>
                                  <Info className="size-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm">
                                  <p>{functionality.info}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              {functionality.type === 'icon' ? (
                                functionality.free ? (
                                  <CircleCheckBig className="size-5 text-green-500" />
                                ) : (
                                  <CircleX className="size-5 text-destructive" />
                                )
                              ) : (
                                functionality.free
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center">
                              {functionality.type === 'icon' ? (
                                functionality.premiumMensal ? (
                                  <CircleCheckBig className="size-5 text-green-500" />
                                ) : (
                                  <CircleX className="size-5 text-destructive" />
                                )
                              ) : (
                                functionality.premiumMensal
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="">
                            <div className="flex justify-center">
                              {functionality.type === 'icon' ? (
                                functionality.premiumAnual ? (
                                  <CircleCheckBig className="size-5 text-green-500" />
                                ) : (
                                  <CircleX className="size-5 text-destructive" />
                                )
                              ) : (
                                functionality.premiumAnual
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
