export function phoneFormatter(value: string) {
  value = value.replace(/\D/g, '')

  if (value.length === 10) {
    value = value.replace(/(\d{2})(\d{4})(\d)/, '($1) $2-$3')
  }

  if (value.length === 11) {
    value = value.replace(/(\d{2})(\d{5})(\d)/, '($1) $2-$3')
  }

  return value
}

export function phoneFormatter2(phone: string) {
  // Remove quaisquer caracteres não numéricos
  phone = phone.replace(/\D/g, '')

  // Verifica se o número tem 10 ou 11 dígitos
  if (phone.length !== 10 && phone.length !== 11) {
    return
  }

  // Formata o número de telefone
  const ddd = phone.slice(0, 2)
  let prefixo, sufixo

  if (phone.length === 11) {
    // Número de celular (11 dígitos)
    prefixo = phone.slice(2, 7)
    sufixo = phone.slice(7, 11)
  } else {
    // Número fixo (10 dígitos)
    prefixo = phone.slice(2, 6)
    sufixo = phone.slice(6, 10)
  }

  return `(${ddd}) ${prefixo}-${sufixo}`
}

export function phoneFormatter3(phone: string): string {
  // Remove todos os caracteres que não sejam números
  const phoneOnlyNumbers = phone.replace(/\D/g, '')

  // Se for telefone fixo (10 dígitos)
  if (phoneOnlyNumbers.length <= 10) {
    // Formato (XX) XXXX-XXXX
    return phoneOnlyNumbers
      .replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3')
      .trim()
  }

  // Se for celular (11 dígitos)
  if (phoneOnlyNumbers.length === 11) {
    // Formato (XX) 9XXXX-XXXX
    return phoneOnlyNumbers
      .replace(/^(\d{2})(\d{1})(\d{4})(\d{0,4})$/, '($1) $2 $3-$4')
      .trim()
  }

  // Se for um número maior ou menor, retorna apenas o número
  return phone
}

export function formatPhone4(phone: string): string {
  // Remove todos os caracteres que não sejam números
  const phoneOnlyNumbers = phone.replace(/\D/g, '')

  // Se for celular com 11 dígitos, formata no padrão (XX) 9XXXX-XXXX
  if (phoneOnlyNumbers.length === 11) {
    return phoneOnlyNumbers.replace(
      /^(\d{2})(\d{1})(\d{4})(\d{4})$/,
      '($1) $2 $3-$4',
    )
  }

  // Caso não tenha 11 dígitos, retorna o número sem formatação
  return phone
}
