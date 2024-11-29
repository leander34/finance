export const moneyFormatter = (value: number | string) => {
  return new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  }).format(Number(value))
}
