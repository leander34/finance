/* eslint-disable @typescript-eslint/no-explicit-any */
import type winston from 'winston'

import { makeLogger } from '@/utils/logger/logger-factory'

export class LoggerService {
  private _looger: winston.Logger

  constructor(
    private requestId: string,
    private requestContext: any,
  ) {
    this._looger = makeLogger()
  }

  info(module: string, message: string, meta?: any) {
    this._looger.info(`${this.requestId} [${module}] ${message}`, {
      ...meta,
      requestContext: this.requestContext,
    })
  }

  warn(module: string, message: string, meta?: any) {
    this._looger.warn(`${this.requestId} [${module}] ${message}`, {
      ...meta,
      requestContext: this.requestContext,
    })
  }

  // error(message) {
  //   this._looger.error(message, { context: this.context })
  // }

  // debug(message) {
  //   this._looger.debug(message, { context: this.context })
  // }
}

// export class LoggerServiceBuilder {
//   private _requestId: string = ''
//   private _requestContext: any = {}

//   setRequestId(requestId: string) {
//     this._requestId = requestId
//     return this
//   }

//   setRequestContext(requestContext: any) {
//     this._requestId = requestId
//     return this
//   }

//   getLogger() {
//     return new LoggerService(this._requestId)
//   }
// }
