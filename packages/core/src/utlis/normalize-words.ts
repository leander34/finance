export const normalizeWords = (word: string, includeNumbers = false) => {
  // Remove acentos
  const wordsWithoutAccent = word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (includeNumbers) {
    const wordsWithoutSpecialCharacters = wordsWithoutAccent.replace(
      /[^a-zA-Z0-9]/g, // Inclui 0-9 para manter números
      '',
    )

    return wordsWithoutSpecialCharacters
  }

  // Remove caracteres especiais, espaços
  const wordsWithoutSpecialCharacters = wordsWithoutAccent.replace(
    /[^a-zA-Z]/g,
    '',
  )

  return wordsWithoutSpecialCharacters
}
