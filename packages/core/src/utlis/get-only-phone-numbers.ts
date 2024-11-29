export function getOnlyPhoneNumbers(input: string) {
  const regex = /(?<=whatsapp:)\+\d{1,3}\d{8,15}/
  const match = input.match(regex)!
  const result = match[0]
  const onlyNumbers = result.replace('+', '')
  return onlyNumbers
}
