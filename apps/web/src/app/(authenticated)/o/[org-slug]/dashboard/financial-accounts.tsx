'use client'
import { moneyFormatter } from '@saas/core'
import { useQuery } from '@tanstack/react-query'
import {
  CreditCard,
  Landmark,
  Loader2,
  Plus,
  TriangleAlert,
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { useState } from 'react'

import { CreateOrUpdateFinancialAccountModal } from '@/components/global/create-or-update-financial-account-modal'
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
import { fetchOverviewFinancialAccountsHttp } from '@/http/financial-accounts/fetch-overview-financial-accounts-http'
import { cn } from '@/lib/utils'

export function FinancialAccounts() {
  const { 'org-slug': currentOrg } = useParams<{
    'org-slug': string
  }>()
  const [showFinancialAccountModal, setShowFinancialAccountModal] =
    useState(false)
  const { data, isLoading } = useQuery({
    queryKey: ['primary', 'overview-accounts'],
    queryFn: async () => {
      // await fakeDelay(5000)
      return fetchOverviewFinancialAccountsHttp(currentOrg)
    },
  })
  return (
    <Card className={cn('overflow-hidden', isLoading && 'opacity-50')}>
      {/* {JSON.stringify(data, null, 2)} */}
      <CardHeader className="flex-row items-start justify-between space-y-0 border-b pb-2">
        <div className="space-y-2">
          <div className="space-y-1">
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 size-4 text-muted-foreground" />
              Contas
            </CardTitle>
            {isLoading ? (
              <Skeleton className="h-4 w-[200px]" />
            ) : (
              <CardDescription>
                {data?.amountOfFinancialAccounts
                  ? `Você tem ${data?.amountOfFinancialAccounts ?? 0} conta(s)
              cadastrada(s).`
                  : 'Nenhuma conta cadastrada ainda.'}
              </CardDescription>
            )}
          </div>
          {/* <div className="flex flex-col">
            <span className="text-sm font-medium leading-none tracking-tight">
              Saldo nas contas
            </span>
            <span className="text-2xl font-semibold tracking-tight">
              R$ 500,00
            </span>
          </div> */}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFinancialAccountModal(true)}
        >
          Adicionar
        </Button>
      </CardHeader>
      {/* <div className="bg-red-400">dfs</div> */}
      {isLoading ? (
        <div className="flex h-[154px] items-center justify-center bg-primary/10 shadow-sm">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <CardContent className="pt-6">
          {!data?.financialAccounts || data.financialAccounts.length === 0 ? (
            <div className="flex w-full flex-col items-center justify-center">
              <Landmark
                className="size-8 text-muted-foreground"
                strokeWidth={1.2}
              />
              <div className="mt-1 flex flex-col items-center gap-1">
                <span className="text-base font-medium leading-none tracking-tight">
                  Nenhuma conta
                </span>
                <span className="text-sm leading-none tracking-tight text-muted-foreground">
                  Cadastre uma nova conta agora
                </span>
              </div>
              <Button
                size="sm"
                className="mt-3"
                onClick={() => setShowFinancialAccountModal(true)}
              >
                <Plus className="mr-1.5 size-4" />
                Adicionar
              </Button>
            </div>
          ) : (
            data.financialAccounts.map((account, i) => {
              return (
                <div key={account.id}>
                  <div className="flex items-center gap-2.5">
                    {account.imageUrl && (
                      <img
                        src={account.imageUrl}
                        alt="Icon do banco"
                        className="size-10 rounded-full"
                      />
                    )}
                    <div className="flex flex-1 items-center justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold leading-none tracking-tight">
                          {account.name}
                        </span>
                        <span className="text-xs leading-none tracking-tight">
                          Saldo atual:{' '}
                          <span className="font-semibold">
                            {moneyFormatter(account.currentBalance)}
                          </span>
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs leading-none tracking-tight">
                          Entradas do mês:{' '}
                          <span className="font-semibold">
                            {moneyFormatter(account.expectedRevenuesValue)}
                          </span>
                        </span>
                        <span className="text-xs leading-none tracking-tight">
                          Saídas do mês:{' '}
                          <span className="font-semibold">
                            {moneyFormatter(
                              account.expectedExpensesValue < 0
                                ? account.expectedExpensesValue * -1
                                : account.expectedExpensesValue,
                            )}
                          </span>{' '}
                        </span>
                      </div>
                    </div>
                  </div>
                  {account.visibledInOverallBalance === false && (
                    <div className="mt-1 flex items-center gap-1">
                      <TriangleAlert className="size-3 shrink-0 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Conta não incluída para os cálculos dessa página.
                      </span>
                    </div>
                  )}
                  {data.financialAccounts.length > i + 1 && (
                    <Separator className="my-3" />
                  )}
                </div>
              )
            })
          )}
          {data && data.amountOfFinancialAccounts > 5 && (
            <>
              <Separator className="my-3" />
              <Button variant="secondary" className="w-full" asChild>
                <LinkWithSlug href="/contas-financeiras">
                  Ver todas contas
                </LinkWithSlug>
              </Button>
            </>
          )}
        </CardContent>
      )}
      <CreateOrUpdateFinancialAccountModal
        open={showFinancialAccountModal}
        handleOpenChangeModal={setShowFinancialAccountModal}
      />
    </Card>
  )
}
