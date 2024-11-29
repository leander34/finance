'use client'
import { dayjs, fakeDelay } from '@saas/core'
import { useQuery } from '@tanstack/react-query'
import { EyeOff } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import qs from 'query-string'

import { Heading } from '@/components/global/heading'
import { PageContentContainer } from '@/components/global/page-content-container'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getUserProfileHttp } from '@/http/auth/user/get-user-profile-http'

import { MonthPicker } from '../../../../../components/global/month-picker'
import { AreaVariant, BankBalanceVariantion } from './bank-balance-variation'
import { CreditCards } from './credit-cards'
import { ExpensesOfTheMonth } from './expenses-of-the-month'
import { FinancialAccounts } from './financial-accounts'
import { MonthlyRevenueExpenseChart } from './monthly-revenue-expense-chart'
import { OverviewData } from './overview-data'
export function DashboardContent() {
  // const [currentSelectedDate, setCurrentSelectedDate] = useState(() =>
  //   dayjs().startOf('month').toDate(),
  // )
  const searchParams = useSearchParams()
  const currentSelectedDate =
    searchParams.get('data-inicio') ??
    dayjs().startOf('month').format('YYYY-MM-DD')
  function handleChangeCurrentDate(date: string) {
    const currentUrl = window.location.href.split('?')[0]
    const currentQuery = qs.parse(window.location.search)
    const updatedQuery = {
      ...currentQuery,
    }
    updatedQuery['data-inicio'] = date

    const newUrl = qs.stringifyUrl(
      {
        url: currentUrl,
        query: updatedQuery,
      },
      { skipNull: true, sort: false },
    )

    window.history.pushState({}, '', newUrl)
  }

  const { data, isLoading: isLoadingUserProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      return getUserProfileHttp()
    },
  })
  return (
    <PageContentContainer>
      <div className="relative flex items-start justify-between">
        <Heading.Root>
          <Heading.Title>
            Bem vindo de volta,{' '}
            {isLoadingUserProfile ? (
              <Skeleton className="inline-flex h-5 w-[260px]" />
            ) : (
              <>{data?.user.name}!</>
            )}
          </Heading.Title>
          <Heading.Description>
            Crie, gerencie e obtenha insights sobre suas contas e cartões de
            crédito
          </Heading.Description>
        </Heading.Root>
        {/* <div className="absolute left-1/2 -translate-x-1/2">
          <MonthPicker />
        </div> */}
        <div className="flex items-center gap-4">
          {/* <Button onClick={() => handleChangeCurrentDate('2024-10-01')}>
            Change
          </Button>
          <span>{startDate}</span> */}
          <MonthPicker
            handleChangeCurrentDate={handleChangeCurrentDate}
            currentSelectedDate={currentSelectedDate}
          />
          <Button variant="ghost">
            Ocultar números{' '}
            <EyeOff className="ml-2 size-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <OverviewData currentSelectedDate={currentSelectedDate} />

      <div className="grid gap-4 pt-6 md:grid-cols-2 lg:grid-cols-6">
        {/* <MonthlyRevenueExpenseChart /> */}
        {/* <BankBalanceVariantion /> */}
        <AreaVariant />
        <div className="col-span-2 flex flex-col gap-4">
          <CreditCards />
          <FinancialAccounts />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <MonthlyRevenueExpenseChart />
        <ExpensesOfTheMonth />
      </div>

      {/* <div className="">
        <FinanceControlCard />
      </div> */}

      {/* <div className="">
        <CategoriesCard />
      </div> */}

      {/* <div className="">
        <TagsCard />
      </div> */}

      {/* <div>
        <CreditCardInsights />
      </div> */}
    </PageContentContainer>
  )
}
