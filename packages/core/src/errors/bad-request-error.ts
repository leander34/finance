import { BaseError, type ErrorPaths } from './base-error'

export class BadRequestError extends BaseError {
  constructor(path: ErrorPaths, language = 'pt-br') {
    // super(`${language}.${path}`, 400, 'Bad Request Error')
    super(path, 400, 'Bad Request Error')
  }
}
