import { dayjs } from '@saas/core'

import type { RecurrencePeriod } from '@/@types/recurrence-period'
export function getAmountRecurrenceRepetitionOld(
  recurrencePeriod: RecurrencePeriod,
) {
  const firstRealizationDate = '2020-03-28'
  const today = dayjs()
  if (recurrencePeriod === 'anual') {
    // mas quando comeca
    const sta = dayjs(firstRealizationDate)
    const daysDiff = today.diff(sta, 'day')
    console.log(daysDiff)

    const years = Math.floor(daysDiff / 365)
    let recurrenceRepetition = years
    console.log('years', years)
    const daysRest = daysDiff % (6 * 30)
    console.log(daysRest)
    console.log(6 * 30 - daysRest)
    console.log(daysDiff % 365)
    if (sta.add(180, 'day').isBefore(today)) {
      recurrenceRepetition += 1
    }
    // se ainda for menor do que a data de hoje
    // ap
    return {
      recurrenceRepetition,
      intervalInDays: 6 * 30 - daysRest,
    } // menos a quantidade de dias que ja se passaram
  }

  if (recurrencePeriod === 'semestral') {
    return { recurrenceRepetition: 1, intervalInDays: 3 * 30 }
  }

  if (recurrencePeriod === 'trimestral') {
    return { recurrenceRepetition: 2, intervalInDays: 90 }
  }

  if (recurrencePeriod === 'bimestral') {
    return { recurrenceRepetition: 3, intervalInDays: 45 }
  }

  if (recurrencePeriod === 'mensal') {
    return { recurrenceRepetition: 6, intervalInDays: 90 }
  }

  if (recurrencePeriod === 'semanal') {
    return { recurrenceRepetition: 4, intervalInDays: 15 }
  }

  if (recurrencePeriod === 'quinzenal') {
    return { recurrenceRepetition: 2, intervalInDays: 15 }
  }

  if (recurrencePeriod === 'diario') {
    return { recurrenceRepetition: 30, intervalInDays: 15 }
  }

  return { recurrenceRepetition: 1, intervalInDays: 30 }
}

export function getAmountRecurrenceRepetition(
  recurrencePeriod: RecurrencePeriod,
  firstRealizationDate: string,
) {
  const quantityOfYears = 5
  const interval = 2
  const today = dayjs()
  if (recurrencePeriod === 'anual') {
    // mas quando comeca
    const frd = dayjs(firstRealizationDate)
    const daysDiff = today.diff(frd, 'day')

    const years = Math.floor(daysDiff / 365)
    const recurrenceRepetition = years < 0 ? 0 : years

    return {
      recurrenceRepetition: recurrenceRepetition + quantityOfYears,
      interval,
    }
  }

  if (recurrencePeriod === 'semestral') {
    const frd = dayjs(firstRealizationDate)
    const daysDiff = today.diff(frd, 'day')
    const semesters = Math.floor(daysDiff / (6 * 30))
    // const semesters = years * 2

    const recurrenceRepetition = semesters < 0 ? 0 : semesters

    return {
      recurrenceRepetition: recurrenceRepetition + quantityOfYears * 2,
      interval,
    }
  }

  if (recurrencePeriod === 'trimestral') {
    const frd = dayjs(firstRealizationDate)
    const daysDiff = today.diff(frd, 'day')
    const quarters = Math.floor(daysDiff / (3 * 30))
    // const quarters = years * 4

    const recurrenceRepetition = quarters < 0 ? 0 : quarters

    return {
      recurrenceRepetition: recurrenceRepetition + quantityOfYears * 4,
      interval,
    }
  }

  if (recurrencePeriod === 'bimestral') {
    const frd = dayjs(firstRealizationDate)
    const daysDiff = today.diff(frd, 'day')
    const bimonthly = Math.floor(daysDiff / (2 * 30))
    // const bimonthly = years * 6

    const recurrenceRepetition = bimonthly < 0 ? 0 : bimonthly

    return {
      recurrenceRepetition: recurrenceRepetition + quantityOfYears * 6,
      interval,
    }
  }

  if (recurrencePeriod === 'mensal') {
    const frd = dayjs(firstRealizationDate)
    const daysDiff = today.diff(frd, 'day')
    const months = Math.floor(daysDiff / 30)
    // const months = years * 12
    const recurrenceRepetition = months < 0 ? 0 : months

    console.log('vou teste')
    console.log(daysDiff)
    console.log(months)
    console.log(recurrenceRepetition + quantityOfYears * 12)
    console.log('vou teste')

    return {
      recurrenceRepetition: recurrenceRepetition + quantityOfYears * 12,
      interval,
    }
  }

  if (recurrencePeriod === 'quinzenal') {
    const frd = dayjs(firstRealizationDate)
    const daysDiff = today.diff(frd, 'day')
    const fortnightly = Math.floor(daysDiff / 15)

    const recurrenceRepetition = fortnightly < 0 ? 0 : fortnightly

    return {
      recurrenceRepetition: recurrenceRepetition + quantityOfYears * 12 * 2,
      interval,
    }
  }

  if (recurrencePeriod === 'semanal') {
    const frd = dayjs(firstRealizationDate)
    const daysDiff = today.diff(frd, 'day')
    const weeks = Math.floor(daysDiff / 7)

    const recurrenceRepetition = weeks < 0 ? 0 : weeks

    return {
      recurrenceRepetition: recurrenceRepetition + quantityOfYears * 12 * 4,
      interval,
    }
  }

  if (recurrencePeriod === 'diario') {
    const frd = dayjs(firstRealizationDate)
    const daysDiff = today.diff(frd, 'day')
    const days = Math.floor(daysDiff)

    const recurrenceRepetition = days < 0 ? 0 : days

    return {
      recurrenceRepetition: recurrenceRepetition + 1 * 12 * 30,
      interval,
    }
  }

  return { recurrenceRepetition: 500, interval }
}
