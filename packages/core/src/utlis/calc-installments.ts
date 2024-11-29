export function calcInstallments(
  valorTotal: number,
  numeroParcelas: number,
): number[] {
  // Transforma o valor total em centavos
  const valorTotalCentavos = Math.round(valorTotal * 100)

  // Calcula o valor básico de cada parcela em centavos
  const valorParcelaCentavos = Math.floor(valorTotalCentavos / numeroParcelas)

  // Calcula a sobra em centavos
  const sobraCentavos = valorTotalCentavos % numeroParcelas

  // Cria um array com o valor das parcelas em centavos
  const parcelasCentavos = Array(numeroParcelas).fill(valorParcelaCentavos)

  // Adiciona a sobra à primeira parcela
  // parcelasCentavos[0] += sobraCentavos
  parcelasCentavos[parcelasCentavos.length - 1] += sobraCentavos

  // for (let i = 0; i < sobraCentavos; i++) {
  //   parcelasCentavos[parcelasCentavos.length - 1 - i] += 1
  // }

  // for (let i = 0; i < sobraCentavos; i++) {
  //   parcelasCentavos[i] += 1
  // }

  // Converte as parcelas de volta para reais
  const parcelas = parcelasCentavos.map((parcela) => parcela / 100)

  return parcelas
}

export function installmentValue(valorTotal: number, numeroParcelas: number) {
  // Transforma o valor total em centavos
  const valorTotalCentavos = Math.round(valorTotal * 100)

  // Calcula o valor básico de cada parcela em centavos
  const valorParcelaCentavos = Math.floor(valorTotalCentavos / numeroParcelas)

  return valorParcelaCentavos / 100
}
