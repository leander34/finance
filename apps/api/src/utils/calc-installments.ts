import dinero from 'dinero.js'

export function calcInstallments(
  amount: dinero.Dinero,
  amountOfInstallments: number,
): dinero.Dinero[] {
  const isNegative = amount.isNegative()
  const newAmount = amount.multiply(isNegative ? -1 : 1)

  const installmentAmount = dinero({
    amount: Math.floor(newAmount.getAmount() / amountOfInstallments),
    currency: 'BRL',
  })

  const realValue = installmentAmount.multiply(amountOfInstallments)

  const cents = newAmount.subtract(realValue)

  const installments =
    Array<dinero.Dinero>(amountOfInstallments).fill(installmentAmount)

  installments[installments.length - 1] = installmentAmount.add(cents)

  return installments.map((installment) =>
    installment.multiply(isNegative ? -1 : 1),
  )
}

export function calculateValorParcela(
  valueLink: number,
  quantParcelas: number,
  index: number,
): string {
  // valor de cada parcela
  const valorParcela = (valueLink / quantParcelas).toFixed(2)
  // valor real que seria o link
  const valorReal = (Number(valorParcela) * quantParcelas).toFixed(2)
  if (Number(valorReal) < valueLink) {
    const sobra = (Number(valueLink) - Number(valorReal)).toFixed(2)
    const condicao = Number(sobra) % 2 === 0
    if (condicao) {
      if (Number(sobra) >= 0.04) {
        const newSobra = Number(sobra) / 2
        if (index === 0) {
          // valor da sobra precisa ser dividido por 2
          return (Number(valorParcela) + Number(newSobra)).toFixed(2)
        }

        if (index === 1) {
          return (Number(valorParcela) + Number(newSobra)).toFixed(2)
        }
      } else {
        if (index === 0) {
          return (Number(valorParcela) + Number(sobra)).toFixed(2)
        }
      }
    } else {
      if (index === 0) {
        return (Number(valorParcela) + Number(sobra)).toFixed(2)
      }
    }
  }

  if (Number(valorReal) > valueLink) {
    const sobra = (Number(valorReal) - Number(valueLink)).toFixed(2)
    const condicao = Number(sobra) % 2 === 0
    if (condicao) {
      if (Number(sobra) >= 0.04) {
        const newSobra = Number(sobra) / 2
        if (index === 0) {
          // valor da sobra precisa ser dividido por 2
          return (Number(valorParcela) - Number(newSobra)).toFixed(2)
        }

        if (index === 1) {
          return (Number(valorParcela) - Number(newSobra)).toFixed(2)
        }
      } else {
        if (index === 0) {
          return (Number(valorParcela) - Number(sobra)).toFixed(2)
        }
      }
    } else {
      if (index === 0) {
        return (Number(valorParcela) - Number(sobra)).toFixed(2)
      }
    }
  }

  return valorParcela
}
