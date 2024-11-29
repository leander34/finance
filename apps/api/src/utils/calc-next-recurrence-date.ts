import { dayjs } from '@saas/core'

import type { RecurrencePeriod } from '@/@types/recurrence-period'
export function calcNextRecurrenceDate(
  currentDate: string,
  recurrencePeriod: RecurrencePeriod,
  day: number,
) {
  let date = dayjs(currentDate)

  if (recurrencePeriod === 'anual') {
    date = date.add(1, 'year')
  }

  if (recurrencePeriod === 'semestral') {
    date = date.add(6, 'month')
    date =
      day > date.daysInMonth() ? date.endOf('month') : date.set('date', day)
  }

  if (recurrencePeriod === 'trimestral') {
    date = date.add(3, 'month')
    date =
      day > date.daysInMonth() ? date.endOf('month') : date.set('date', day)
  }
  if (recurrencePeriod === 'bimestral') {
    date = date.add(2, 'month')
    date =
      day > date.daysInMonth() ? date.endOf('month') : date.set('date', day)
  }

  if (recurrencePeriod === 'mensal') {
    // vejo qual o dia
    // caso o dia seja maior que a quantidade de dias no mês volto para o ultimo dia do mês
    date = date.add(1, 'month')
    date =
      day > date.daysInMonth() ? date.endOf('month') : date.set('date', day)
  }

  if (recurrencePeriod === 'semanal') {
    date = date.add(1, 'week')
  }

  if (recurrencePeriod === 'quinzenal') {
    date = date.add(15, 'day')
  }

  if (recurrencePeriod === 'diario') {
    date = date.add(1, 'day')
  }

  return date.format('YYYY-MM-DD')
}
