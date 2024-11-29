export function randomNumber(min: number = 0, max: number = 9999) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
