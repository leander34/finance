import { dayjs } from '@saas/core'
export function generateInvoiceWithIndexes({
  invoiceClosingDate,
  invoiceDueDate,
  index,
  startDate,
}: {
  invoiceClosingDate: number
  invoiceDueDate: number
  index: number
  startDate?: string
}) {
  const todayDate = dayjs()
  const day = todayDate.day()
  //   const month = todayDate.month() + 1
  if (invoiceClosingDate >= day) {
    const basePeriodStartMonth = todayDate
      .set('month', index - 1)
      .subtract(1, 'month')
    const basePeriodEndMonth = todayDate.set('month', index - 1)
    const baseDueDateMonth = todayDate.set('month', index - 1)
    // preciso criar a fatura desse mês ainda
    // const periodStart = '2024-09-09'
    let periodStart = todayDate
      .set('month', index - 1)
      .subtract(1, 'month')
      .set('date', invoiceClosingDate + 1)

    if (invoiceClosingDate + 1 > basePeriodStartMonth.daysInMonth()) {
      periodStart = basePeriodStartMonth.add(1, 'month').startOf('month')
    }
    // // const periodEnd = '2024-10-08'
    let periodEnd = todayDate
      .set('month', index - 1)
      .set('date', invoiceClosingDate)

    if (invoiceClosingDate > basePeriodEndMonth.daysInMonth()) {
      periodEnd = basePeriodEndMonth.endOf('month')
    }
    // // const dueDate = '2024-10-15' // outubro
    let dueDate = todayDate.set('month', index - 1) // outubro

    if (dueDate.daysInMonth() < invoiceDueDate) {
      if (invoiceClosingDate > invoiceDueDate) {
        console.log('fev')
        dueDate = dueDate.add(1, 'month').set('date', invoiceDueDate)
      } else {
        dueDate = dueDate.endOf('month')
      }
    } else {
      dueDate = dueDate.set('date', invoiceDueDate)
    }

    // se o dia de vencimento for 31 preciso voltar para dia 30, 29, 28 em alguns casos.

    // se o dia de fechamento for maior que o dia de vencimento (31 -> 06)
    if (
      invoiceClosingDate > invoiceDueDate &&
      !(baseDueDateMonth.daysInMonth() < invoiceDueDate)
    ) {
      dueDate = dueDate.add(1, 'month')
    }

    // if (invoiceDueDate > baseDueDateMonth.daysInMonth()) {
    //   const previousMonth = dueDate.subtract(1, 'month')
    //   const newDueDate =
    //     invoiceDueDate > previousMonth.daysInMonth()
    //       ? previousMonth.endOf('month')
    //       : previousMonth
    //   dueDate = newDueDate
    // }

    // se alguma data period start ou end for maior que a quantidade de daysInMonth o dia

    return {
      periodStart: periodStart.format('YYYY-MM-DD'),
      periodEnd: periodEnd.format('YYYY-MM-DD'),
      dueDate: dueDate.format('YYYY-MM-DD'),
      month: todayDate.set('month', index - 1).month() + 1,
      year: periodEnd.year(),
    }
  } else {
    const basePeriodStartMonth = todayDate.set('month', index - 2)
    const basePeriodEndMonth = todayDate.set('month', index - 2).add(1, 'month')
    const baseDueDateMonth = todayDate.set('month', index - 2).add(1, 'month')
    let periodStart = todayDate
      .set('month', index - 2)
      .set('date', invoiceClosingDate + 1)
    if (invoiceClosingDate + 1 > basePeriodStartMonth.daysInMonth()) {
      periodStart = basePeriodStartMonth.add(1, 'month').startOf('month')
    }
    // // const periodEnd = '2024-10-08'
    let periodEnd = todayDate
      .set('month', index - 2)
      .add(1, 'month')
      .set('date', invoiceClosingDate)

    if (invoiceClosingDate > basePeriodEndMonth.daysInMonth()) {
      periodEnd = basePeriodEndMonth.endOf('month')
    }
    // // const dueDate = '2024-10-15' // outubro
    let dueDate = todayDate.set('month', index - 2).add(1, 'month')

    if (dueDate.daysInMonth() < invoiceDueDate) {
      if (invoiceClosingDate > invoiceDueDate) {
        console.log('fev')
        dueDate = dueDate.add(1, 'month').endOf('month')
      } else {
        dueDate = dueDate.endOf('month')
      }
    } else {
      dueDate = dueDate.set('date', invoiceDueDate)
    }

    if (
      invoiceClosingDate > invoiceDueDate &&
      !(baseDueDateMonth.daysInMonth() < invoiceDueDate)
    ) {
      dueDate = dueDate.add(1, 'month')
    }

    // if (invoiceDueDate > baseDueDateMonth.daysInMonth()) {
    //   dueDate = dueDate.subtract(1, 'month').endOf('month')
    // }

    // if (invoiceDueDate > baseDueDateMonth.daysInMonth()) {

    //   const previousMonth = dueDate.subtract(1, 'month')
    //   const newDueDate =
    //     invoiceDueDate > previousMonth.daysInMonth()
    //       ? previousMonth.endOf('month')
    //       : previousMonth
    //   dueDate = newDueDate
    // }

    // preciso criar a fatura do proximo "mês"

    return {
      periodStart: periodStart.format('YYYY-MM-DD'),
      periodEnd: periodEnd.format('YYYY-MM-DD'),
      dueDate: dueDate.format('YYYY-MM-DD'),
      month: todayDate.set('month', index - 1).month() + 1,
      year: periodEnd.year(),
    }
  }
}

export function generateInvoice({
  baseRealizationDate,
  invoiceClosingDate,
  invoiceDueDate,
}: {
  baseRealizationDate: string
  invoiceClosingDate: number
  invoiceDueDate: number
}) {
  const date = dayjs(baseRealizationDate)
  const day = date.date()
  const month = date.month() + 1
  const nextInvoiceMonth =
    invoiceClosingDate >= day ? month : date.set('month', month + 1).month()
  if (invoiceClosingDate >= day) {
    const basePeriodStartMonth = date.subtract(1, 'month')
    const basePeriodEndMonth = date
    const baseDueDateMonth = date
    // preciso criar a fatura desse mês ainda
    // const periodStart = '2024-09-09'
    let periodStart = date
      .subtract(1, 'month')
      .set('date', invoiceClosingDate + 1)

    if (invoiceClosingDate + 1 > basePeriodStartMonth.daysInMonth()) {
      periodStart = basePeriodStartMonth.add(1, 'month').startOf('month')
    }

    let periodEnd = date.set('date', invoiceClosingDate)

    if (invoiceClosingDate > basePeriodEndMonth.daysInMonth()) {
      periodEnd = basePeriodEndMonth.endOf('month')
    }
    // // const dueDate = '2024-10-15' // outubro
    let dueDate = baseDueDateMonth
    if (dueDate.daysInMonth() < invoiceDueDate) {
      if (invoiceClosingDate > invoiceDueDate) {
        console.log('fev')
        dueDate = dueDate.add(1, 'month').endOf('month')
      } else {
        dueDate = dueDate.endOf('month')
      }
    } else {
      dueDate = dueDate.set('date', invoiceDueDate)
    }

    if (
      invoiceClosingDate > invoiceDueDate &&
      !(baseDueDateMonth.daysInMonth() < invoiceDueDate)
    ) {
      dueDate = dueDate.add(1, 'month')
    }

    // if (invoiceDueDate > baseDueDateMonth.daysInMonth()) {
    //   const previousMonth = dueDate.subtract(1, 'month')
    //   const newDueDate =
    //     invoiceDueDate > previousMonth.daysInMonth()
    //       ? previousMonth.endOf('month')
    //       : previousMonth
    //   dueDate = newDueDate
    // }

    return {
      periodStart: periodStart.format('YYYY-MM-DD'),
      periodEnd: periodEnd.format('YYYY-MM-DD'),
      dueDate: dueDate.format('YYYY-MM-DD'),
      month: nextInvoiceMonth,
      year: periodEnd.year(),
    }
  } else {
    const basePeriodStartMonth = date
    const basePeriodEndMonth = date.add(1, 'month')
    const baseDueDateMonth = date.add(1, 'month')
    let periodStart = date.set('date', invoiceClosingDate + 1)
    if (invoiceClosingDate + 1 > basePeriodStartMonth.daysInMonth()) {
      periodStart = basePeriodStartMonth.add(1, 'month').startOf('month')
    }
    // // const periodEnd = '2024-10-08'
    let periodEnd = date.add(1, 'month').set('date', invoiceClosingDate)

    if (invoiceClosingDate > basePeriodEndMonth.daysInMonth()) {
      periodEnd = basePeriodEndMonth.endOf('month')
    }
    // // const dueDate = '2024-10-15' // outubro
    let dueDate = date.add(1, 'month')

    if (dueDate.daysInMonth() < invoiceDueDate) {
      if (invoiceClosingDate > invoiceDueDate) {
        console.log('fev')
        dueDate = dueDate.add(1, 'month').endOf('month')
      } else {
        dueDate = dueDate.endOf('month')
      }
    } else {
      dueDate = dueDate.set('date', invoiceDueDate)
    }

    if (
      invoiceClosingDate > invoiceDueDate &&
      !(baseDueDateMonth.daysInMonth() < invoiceDueDate)
    ) {
      dueDate = dueDate.add(1, 'month')
    }

    // if (invoiceDueDate > baseDueDateMonth.daysInMonth()) {
    //   const previousMonth = dueDate.subtract(1, 'month')
    //   const newDueDate =
    //     invoiceDueDate > previousMonth.daysInMonth()
    //       ? previousMonth.endOf('month')
    //       : previousMonth
    //   dueDate = newDueDate
    // }

    return {
      periodStart: periodStart.format('YYYY-MM-DD'),
      periodEnd: periodEnd.format('YYYY-MM-DD'),
      dueDate: dueDate.format('YYYY-MM-DD'),
      month: nextInvoiceMonth,
      year: periodEnd.year(),
    }
  }
}

export function updateCurrentInvoice({
  invoiceClosingDate,
  invoiceDueDate,
  currentPeriodStart,
  currentPeriodEnd,
  currentDueDate,
  month,
  year,
}: {
  currentPeriodStart: string
  currentPeriodEnd: string
  currentDueDate: string
  invoiceClosingDate: number
  invoiceDueDate: number
  month: number
  year: number
}) {
  const basePeriodStartMonth = dayjs(currentPeriodStart)
  const basePeriodEndMonth = dayjs(currentPeriodEnd)
  const baseDueDateMonth = dayjs()
    .set('year', year)
    .set('month', month - 1)
  // não vai alterar a data inicio da fatura
  // se a novo dia de fechamento for menor que o dia de fechamento atual, somar um mês

  if (basePeriodEndMonth.month() === baseDueDateMonth.month()) {
    // um tipo de tratamento
    // se o vencimento for no mesmo mes do fechamento

    // nao permitir que o dia do vencimento seja antes do dia do fechamento

    let newPeriodEnd = dayjs(currentPeriodEnd).set('date', invoiceClosingDate)

    if (invoiceClosingDate > basePeriodEndMonth.daysInMonth()) {
      newPeriodEnd = basePeriodEndMonth.endOf('month')
    }

    // if (invoiceClosingDate < basePeriodEndMonth.date()) {
    //   newPeriodEnd = basePeriodEndMonth.add(1, 'month')
    // }

    let newDueDate = baseDueDateMonth
    // alterar para base

    if (baseDueDateMonth.daysInMonth() < invoiceDueDate) {
      if (invoiceClosingDate > invoiceDueDate) {
        console.log('fev')
        newDueDate = newDueDate.add(1, 'month').endOf('month')
      } else {
        newDueDate = newDueDate.endOf('month')
      }
    } else {
      newDueDate = newDueDate.set('date', invoiceDueDate)
    }

    if (
      invoiceClosingDate > invoiceDueDate &&
      !(baseDueDateMonth.daysInMonth() < invoiceDueDate) // colocar em outros lugares
    ) {
      newDueDate = newDueDate.add(1, 'month')
    }

    console.log(Math.floor(newPeriodEnd.diff(basePeriodStartMonth, 'day')))

    // if (Math.floor(newPeriodEnd.diff(basePeriodStartMonth, 'day')) < 28) {
    //   // erro
    //   // ou proximo mes
    // }

    return {
      periodStart: currentPeriodStart,
      periodEnd: newPeriodEnd.format('YYYY-MM-DD'),
      dueDate: newDueDate.format('YYYY-MM-DD'),
    }
  } else {
    // outro tipo de tratamento
    // se o mes for diferente

    let newPeriodEnd = dayjs(currentPeriodEnd).set('date', invoiceClosingDate)

    if (invoiceClosingDate > basePeriodEndMonth.daysInMonth()) {
      newPeriodEnd = basePeriodEndMonth.endOf('month')
    }

    // if (invoiceClosingDate < basePeriodEndMonth.date()) {
    //   newPeriodEnd = basePeriodEndMonth.add(1, 'month')
    // }

    let newDueDate = baseDueDateMonth
    // alterar para base

    if (baseDueDateMonth.daysInMonth() < invoiceDueDate) {
      if (invoiceClosingDate > invoiceDueDate) {
        console.log('fev')
        newDueDate = newDueDate.add(1, 'month').endOf('month')
      } else {
        newDueDate = newDueDate.endOf('month')
      }
    } else {
      newDueDate = newDueDate.set('date', invoiceDueDate)
    }
    if (
      invoiceClosingDate > invoiceDueDate &&
      !(baseDueDateMonth.daysInMonth() < invoiceDueDate) // colocar em outros lugares
    ) {
      newDueDate = newDueDate.add(1, 'month')
    }

    // meses diferentes
    // não permitir voltar a data
    // ex: fechada dia 28, se o novo dia for 26, 22
    /// /???????

    return {
      periodStart: currentPeriodStart,
      periodEnd: newPeriodEnd.format('YYYY-MM-DD'),
      dueDate: newDueDate.format('YYYY-MM-DD'),
    }
  }
  // const {} = updateInvoice({ })
}

export function updateInvoice({
  invoiceClosingDate,
  invoiceDueDate,
  month,
  year,
}: {
  month: number
  year: number
  invoiceClosingDate: number
  invoiceDueDate: number
}) {
  const basePeriodStartMonth = dayjs()
    .set('year', year)
    .set('month', month - 1)
    .subtract(1, 'month')
  const basePeriodEndMonth = dayjs()
    .set('year', year)
    .set('month', month - 1)
  const baseDueDateMonth = dayjs()
    .set('year', year)
    .set('month', month - 1)
  // não vai alterar a data inicio da fatura
  // se a novo dia de fechamento for menor que o dia de fechamento atual, somar um mês

  let periodStart = basePeriodStartMonth.set('date', invoiceClosingDate + 1)

  if (invoiceClosingDate + 1 > basePeriodStartMonth.daysInMonth()) {
    // preciso somar um mes ir para o proximo
    periodStart = basePeriodStartMonth.add(1, 'month').startOf('month')
  }

  let newPeriodEnd = basePeriodEndMonth.set('date', invoiceClosingDate)

  if (invoiceClosingDate > basePeriodEndMonth.daysInMonth()) {
    newPeriodEnd = basePeriodEndMonth.endOf('month')
  }

  let newDueDate = baseDueDateMonth

  // esse fica

  if (baseDueDateMonth.daysInMonth() < invoiceDueDate) {
    if (invoiceClosingDate > invoiceDueDate) {
      console.log('fev')
      newDueDate = newDueDate.add(1, 'month').endOf('month')
    } else {
      newDueDate = newDueDate.endOf('month')
    }
  } else {
    newDueDate = newDueDate.set('date', invoiceDueDate)
  }

  if (
    invoiceClosingDate > invoiceDueDate &&
    !(baseDueDateMonth.daysInMonth() < invoiceDueDate)
  ) {
    newDueDate = newDueDate.add(1, 'month')
  }

  return {
    periodStart: periodStart.format('YYYY-MM-DD'),
    periodEnd: newPeriodEnd.format('YYYY-MM-DD'),
    dueDate: newDueDate.format('YYYY-MM-DD'),
  }
}

export function updateInvoiceNAOUSADA({
  invoiceClosingDate,
  invoiceDueDate,
  currentPeriodStart,
  currentPeriodEnd,
  currentDueDate,
}: {
  currentPeriodStart: string
  currentPeriodEnd: string
  currentDueDate: string
  invoiceClosingDate: number
  invoiceDueDate: number
}) {
  const basePeriodStartMonth = dayjs(currentPeriodStart)
  const basePeriodEndMonth = dayjs(currentPeriodEnd)
  const baseDueDateMonth = dayjs(currentDueDate)
  // const {} = updateInvoice({ })
  let newPeriodStart = dayjs(currentPeriodStart).set(
    'date',
    invoiceClosingDate + 1,
  )

  if (invoiceClosingDate + 1 > basePeriodStartMonth.daysInMonth()) {
    newPeriodStart = basePeriodStartMonth.add(1, 'month').startOf('month')
  }

  let newPeriodEnd = dayjs(currentPeriodEnd).set('date', invoiceClosingDate)

  if (invoiceClosingDate > basePeriodEndMonth.daysInMonth()) {
    newPeriodEnd = basePeriodEndMonth.endOf('month')
  }
  let newDueDate = dayjs(currentDueDate).set('date', invoiceDueDate)

  if (invoiceClosingDate > invoiceDueDate) {
    newDueDate = newDueDate.add(1, 'month')
  }

  if (invoiceDueDate > baseDueDateMonth.daysInMonth()) {
    const previousMonth = newDueDate.subtract(1, 'month')
    const updatedDueDate =
      invoiceDueDate > previousMonth.daysInMonth()
        ? previousMonth.endOf('month')
        : previousMonth
    newDueDate = updatedDueDate
  }

  return {
    periodStart: newPeriodStart.format('YYYY-MM-DD'),
    periodEnd: newPeriodEnd.format('YYYY-MM-DD'),
    dueDate: newDueDate.format('YYYY-MM-DD'),
  }
}
