/* eslint-disable no-constant-condition */
'use client'
import { dayjs, moneyFormatter } from '@saas/core'
import { useQuery } from '@tanstack/react-query'
import { CreditCard, CreditCardIcon, Loader2, Plus } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useState } from 'react'

import { CreateOrUpdateCreditCardModal } from '@/components/global/create-or-update-credit-card-modal'
import { LinkWithSlug } from '@/components/global/link-with-slug'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchCreditCardsWidgetHttp } from '@/http/credit-cards/fetch-credit-cards-widget'

export function CreditCards() {
  const { 'org-slug': currentOrg } = useParams<{
    'org-slug': string
  }>()
  const [showCreditCardsModal, setShowCreditCardsModal] = useState(false)
  const { data, isLoading } = useQuery({
    queryKey: ['primary', 'credit-cards-widget'],
    queryFn: async () => {
      // await fakeDelay(5000)
      return fetchCreditCardsWidgetHttp(currentOrg)
    },
  })
  return (
    <Card className="">
      <CardHeader className="flex-row items-start justify-between space-y-0 border-b pb-2">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 size-4 text-muted-foreground" />
            Cartões de credito
          </CardTitle>
          {isLoading ? (
            <Skeleton className="h-4 w-[200px]" />
          ) : (
            <CardDescription>
              {data?.amountOfCreditCards
                ? `Você tem ${data?.amountOfCreditCards ?? 0} ${data.amountOfCreditCards > 1 ? 'cartões' : 'cartão'}
              cadastrado(s).`
                : 'Nenhuma cartão cadastrado ainda.'}
            </CardDescription>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowCreditCardsModal(true)}
        >
          Adicionar
        </Button>
      </CardHeader>
      {isLoading ? (
        <div className="flex h-[154px] items-center justify-center bg-primary/10 shadow-sm">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <CardContent className="pt-6">
          {!data?.creditCards || data.creditCards.length === 0 ? (
            <div className="flex w-full flex-col items-center justify-center">
              <CreditCardIcon
                className="size-8 text-muted-foreground"
                strokeWidth={1.2}
              />
              <div className="mt-1 flex flex-col items-center gap-1">
                <span className="text-base font-medium leading-none tracking-tight">
                  Nenhum cartão
                </span>
                <span className="text-sm leading-none tracking-tight text-muted-foreground">
                  Cadastre um novo cartão agora
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                className="mt-3"
                onClick={() => setShowCreditCardsModal(true)}
              >
                <Plus className="mr-1.5 size-4" />
                Adicionar
              </Button>
            </div>
          ) : (
            data.creditCards.map((creditCard, i) => {
              return (
                <div className="flex flex-col pt-2" key={creditCard.id}>
                  <div className="flex items-center gap-2.5">
                    <img
                      src={creditCard.imageUrl}
                      alt={creditCard.name}
                      className="size-10 rounded-full"
                    />
                    <div className="flex flex-1 items-end gap-2">
                      <div className="flex w-[120px] flex-col gap-1">
                        <span className="text-sm font-semibold leading-none tracking-tight">
                          {creditCard.name}
                        </span>
                        <span className="text-xs leading-none tracking-tight">
                          {moneyFormatter(creditCard.usedLimit)} gastos
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="overflow-hidden rounded-sm border shadow">
                          <span
                            style={{
                              backgroundColor: creditCard.color,
                              width: `${creditCard.usedLimitInPercentage}%`,
                            }}
                            className="flex h-2.5 rounded-sm"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs leading-none tracking-tight">
                          Fecha{' '}
                          {dayjs(creditCard.currentInvoice?.periodEnd).format(
                            'DD/MM',
                          )}
                        </span>
                        <span className="text-xs leading-none tracking-tight">
                          de {moneyFormatter(creditCard.limit)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {creditCard.currentInvoice && (
                    <div>
                      <span className="text-xs leading-none tracking-tight">
                        Fatura atual (
                        {dayjs()
                          .set('month', creditCard.currentInvoice.month - 1)
                          .set('year', creditCard.currentInvoice.year)
                          .format('MMMM')}
                        ):{' '}
                        <span className="font-semibold">
                          {moneyFormatter(
                            creditCard.currentInvoice.currentInvoiceAmount,
                          )}
                        </span>
                      </span>
                    </div>
                  )}
                  {data.creditCards.length > i + 1 && (
                    <Separator className="my-3" />
                  )}
                </div>
              )
            })
          )}
          {data && data.amountOfCreditCards > 3 && (
            <>
              <Separator className="my-3" />
              <Button variant="secondary" className="w-full" asChild>
                <LinkWithSlug href="/cartoes">Ver todos cartões</LinkWithSlug>
              </Button>
            </>
          )}
        </CardContent>
      )}

      <CreateOrUpdateCreditCardModal
        open={showCreditCardsModal}
        handleOpenChangeModal={setShowCreditCardsModal}
      />
    </Card>
  )
}
