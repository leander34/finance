import { BaseError } from './base-error'

export class InternalServerError extends BaseError {
  constructor(err: Error, language = 'pt-br') {
    super(`${language}.internal-server-error`, 500, 'Internal Server Error')

    console.log({
      name: err.name,
      message: err.message,
      stackTrace: err.stack,
      level: 'fatal',
    })
  }
}
