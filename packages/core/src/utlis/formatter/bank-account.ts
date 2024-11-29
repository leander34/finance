export function bankAccountNumberFormatter(accountNumber: string) {
  let value = accountNumber
  value = value.replace(/\D/g, '')
  const array = value.split('')
  const lastDigit = array.pop()
  const accountNumberWithoutLastDigit = array.join('')
  let definitiveAccountNumber = lastDigit
  if (array.length >= 1) {
    definitiveAccountNumber = `${accountNumberWithoutLastDigit}-${lastDigit}`
  }
  return definitiveAccountNumber ?? ''
}
