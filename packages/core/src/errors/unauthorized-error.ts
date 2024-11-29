import { BaseError, type ErrorPaths } from './base-error'

export class UnauthorizedError extends BaseError {
  constructor(path: ErrorPaths, language = 'pt-br') {
    super(path, 401, 'Unauthorized Error')
  }
}
