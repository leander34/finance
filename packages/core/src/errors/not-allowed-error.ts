import { BaseError, type ErrorPaths } from './base-error'

export class NotAllowedError extends BaseError {
  constructor(path: ErrorPaths, language = 'pt-br') {
    super(path, 403, 'Not Allowed Error')
  }
}
