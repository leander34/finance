'use client'
import { dayjs } from '@saas/core'
import { usePathname, useSearchParams } from 'next/navigation'
import qs from 'query-string'

import { MonthPicker } from '@/components/global/month-picker'
export function MonthPickerWrapper() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
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

  // pensar em remover daqui depois
  if (pathname.endsWith('faturas')) {
    return null
  }

  return (
    <MonthPicker
      handleChangeCurrentDate={handleChangeCurrentDate}
      currentSelectedDate={currentSelectedDate}
    />
  )
}
