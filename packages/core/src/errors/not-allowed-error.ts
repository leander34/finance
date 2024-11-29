import { BaseError } from './base-error'

export class NotAllowedError extends BaseError {
  constructor(path: string, language = 'pt-br') {
    super(`${language}.${path}`, 403, 'Not Allowed Error')
  }
}
