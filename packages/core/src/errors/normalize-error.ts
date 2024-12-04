import { BaseError } from './base-error'
import { InternalServerError } from './internal-server-error'

export function normalizeError(err: Error) {
  if (err instanceof BaseError) {
    return err
  }
  console.log('oi')

  return new InternalServerError(err)
}
