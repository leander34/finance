import { BaseError } from './base-error'

export class ForbiddenError extends BaseError {
  constructor(language = 'pt-br') {
    super(`${language}.forbidden`, 403, 'Forbidden Error')
  }
}
