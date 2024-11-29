// export function phoneValidator(phone: string) {
//   const phoneOnlyNumbers = phone.replace(/\D/g, '')
//   if (phoneOnlyNumbers.length !== 10 && phoneOnlyNumbers.length !== 11) {
//     return false
//   }
//   const regex = /^\(?[1-9]{2}\)? ?(?:[2-8]|9[0-9])[0-9]{3}-?[0-9]{4}$/

//   return regex.test(phone)
// }

// export function phoneValidator(phone: string): boolean {
//   // Remove qualquer caractere que não seja número
//   const phoneOnlyNumbers = phone.replace(/\D/g, '')

//   // Verifica se o número tem 10 ou 11 dígitos
//   if (phoneOnlyNumbers.length !== 10 && phoneOnlyNumbers.length !== 11) {
//     return false
//   }

//   // Expressão regular para validar DDD e número de telefone
//   const regex = /^(?:\(?([1-9][0-9])\)?) ?(?:9?[6-9][0-9]{3})-?[0-9]{4}$/

//   // Testa o número com a regex
//   return regex.test(phoneOnlyNumbers)
// }

export function phoneValidator(phone: string): boolean {
  // Remove qualquer caractere que não seja número
  const phoneOnlyNumbers = phone.replace(/\D/g, '')

  // Verifica se o número tem 11 dígitos (2 para o DDD e 9 para o celular)
  if (phoneOnlyNumbers.length !== 11) {
    return false
  }

  // Expressão regular para validar DDD e número de celular
  const regex = /^\(?[1-9]{2}\)? ?9[6-9][0-9]{3}-?[0-9]{4}$/

  // Testa o número com a regex
  return regex.test(phoneOnlyNumbers)
}

// Vamos quebrar a expressão regular novamente:

// ^ - Início da linha.
// \+? - Opcionalmente, o sinal de mais (+).
// 55 - O código do país 55 é obrigatório.
// \s? - Opcionalmente, um espaço.
// \(?\d{2}\)? - O DDD, que é obrigatório e pode estar entre parênteses.
// \(? - Opcionalmente, um parêntese de abertura.
// \d{2} - Dois dígitos para o DDD.
// \)? - Opcionalmente, um parêntese de fechamento.
// \s? - Opcionalmente, um espaço após o DDD.
// \d{4,5} - O prefixo do telefone, que pode ser de 4 ou 5 dígitos.
// -? - Opcionalmente, um hífen (-).
// \d{4} - Os 4 dígitos finais do telefone.
// $ - Fim da linha.
// Aqui estão alguns exemplos de números que a expressão regular deve validar:

// +55 (11) 91234-5678
// 55 (11) 91234-5678
// (11) 91234-5678
// 11912345678
// +5511912345678
// E aqui estão alguns exemplos de números que ela não deve validar:

// +1 (11) 91234-5678 (código de país errado)
// +55 11 91234-56789 (número de dígitos errado)
// 91234-5678 (sem DDD, que agora é obrigatório)
// Com essa expressão regular, o DDD é obrigatório em todos os casos.
