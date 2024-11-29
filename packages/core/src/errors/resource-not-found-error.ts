import { BaseError, type ErrorPaths } from './base-error'

export class ResourceNotFoundError extends BaseError {
  constructor(path: ErrorPaths, language = 'pt-br') {
    // super(`${language}.${path}`, 400, 'Resource Not Found Error')
    super(path, 400, 'Resource Not Found Error')
  }
}
