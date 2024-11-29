export function documentValidator(document: string | number): boolean {
  const cpfRegex = /^[0-9]{11}$/ // formato: 11 dígitos numéricos
  const cnpjRegex = /^[0-9]{14}$/ // formato: 14 dígitos numéricos

  // Remove caracteres especiais do documento
  document = String(document).replace(/[^\d]+/g, '')
  if (cpfRegex.test(document)) {
    // valida CPF
    const cpf = document.replace(/[^\d]+/g, '')
    if (cpf.length !== 11) {
      return false
    }

    let sum = 0
    let rest

    for (let i = 1; i <= 9; i++) {
      sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i)
    }

    rest = (sum * 10) % 11

    if (rest === 10 || rest === 11) {
      rest = 0
    }

    if (rest !== parseInt(cpf.substring(9, 10))) {
      return false
    }

    sum = 0

    for (let i = 1; i <= 10; i++) {
      sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i)
    }

    rest = (sum * 10) % 11

    if (rest === 10 || rest === 11) {
      rest = 0
    }

    if (rest !== parseInt(cpf.substring(10, 11))) {
      return false
    }

    return true
  } else if (cnpjRegex.test(document)) {
    // valida CNPJ
    const cnpj = document.replace(/[^\d]+/g, '')
    if (cnpj.length !== 14) {
      return false
    }

    // Valida CNPJ
    let soma = 0
    let pos = 5
    let dv1 = 0
    let dv2 = 0

    for (let i = 0; i < 12; i++) {
      soma += parseInt(document.substring(i, i + 1)) * pos
      pos--
      if (pos < 2) {
        pos = 9
      }
    }

    dv1 = soma % 11 < 2 ? 0 : 11 - (soma % 11)

    soma = 0
    pos = 6

    for (let i = 0; i < 13; i++) {
      soma += parseInt(document.substring(i, i + 1)) * pos
      pos--
      if (pos < 2) {
        pos = 9
      }
    }

    dv2 = soma % 11 < 2 ? 0 : 11 - (soma % 11)

    if (
      dv1 !== parseInt(document.substring(12, 13)) ||
      dv2 !== parseInt(document.substring(13, 14))
    ) {
      return false
    }

    return true
  } else {
    return false
  }
}

export function validateDocumentLength(documento: string | number): boolean {
  const documentWithoutSpecialCharacters = String(documento).replace(/\D/g, '')

  const isDocumentValid =
    documentWithoutSpecialCharacters.length === 11 ||
    documentWithoutSpecialCharacters.length === 14

  return isDocumentValid
}
