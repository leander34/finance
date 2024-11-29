export function documentFormatter(value: string) {
  value = value.replace(/\D/g, '')

  if (value.length === 11) {
    value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d)/, '$1.$2.$3-$4')
  }
  if (value.length === 14) {
    value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d)/, '$1.$2.$3/$4-$5')
  }

  return value
}

export function documentFormatterHidden(valor: string) {
  const documentFomatted = documentFormatter(valor)
  const array = documentFomatted.split('')
  array.splice(0, 3, '', '', '')
  array.splice(-2, 2, '', '')
  array.splice(-4, 1, '')
  return array.join('')
}
