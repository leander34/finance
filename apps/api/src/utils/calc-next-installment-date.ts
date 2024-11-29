import { dayjs } from '@saas/core'

import type { InstallmentPeriod } from '@/@types/installment-period'
export function calcNextInstallmentDate(
  currentDate: string,
  installmentPeriod: InstallmentPeriod,
) {
  let date = dayjs(currentDate)

  if (installmentPeriod === 'anos') {
    date = date.add(1, 'year')
  }

  if (installmentPeriod === 'semestres') {
    date = date.add(6, 'month')
  }

  if (installmentPeriod === 'trimestres') {
    date = date.add(3, 'month')
  }
  if (installmentPeriod === 'bimestres') {
    date = date.add(2, 'month')
  }

  if (installmentPeriod === 'meses') {
    date = date.add(1, 'month')
  }

  if (installmentPeriod === 'semanas') {
    date = date.add(1, 'week')
  }

  if (installmentPeriod === 'quinzenas') {
    date = date.add(15, 'day')
  }

  if (installmentPeriod === 'dias') {
    date = date.add(1, 'day')
  }

  return date.format('YYYY-MM-DD')
}
