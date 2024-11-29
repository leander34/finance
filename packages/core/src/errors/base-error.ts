/* eslint-disable @typescript-eslint/no-explicit-any */
import { path } from 'ramda'

import errors from './errors-code.json'
export type ErrorsType = typeof errors

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}.${P}`
    : never
  : never

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

type Paths<T, D extends Prev[number] = 5> = [D] extends [never]
  ? never
  : T extends object
    ? {
        [K in keyof T]: K extends string | number
          ? `${K}` | Join<K, Paths<T[K], Prev[D]>>
          : never
      }[keyof T]
    : never

// type RemoveFirstLevel<T> = T extends object
//   ? {
//       [K in keyof T]: Paths<T[K]>
//     }[keyof T]
//   : never

// type KeysUntilMessage<T> = T extends object
//   ? {
//       [K in keyof T]: K extends 'message' ? never : K | KeysUntilMessage<T[K]>
//     }[keyof T]
//   : never

// export type ErrorPaths = {
//   [K in keyof ErrorsType]: KeysUntilMessage<ErrorsType[K]>
// }
export type ErrorPaths = Paths<ErrorsType>

export class BaseError extends Error {
  private errors: any[] = []
  private errorMessage: string = ''
  constructor(
    errorPath: ErrorPaths,
    private _statusCode: number,
    errorName: string,
  ) {
    const er = path(errorPath.split('.'), errors) as { message: string }
    // super(`[${errorName}] ${er ? er.message : 'Unable to get error message'}`)
    super(`${er ? er.message : 'Unable to get error message'}`)
    // this.errorMessage = er ? er.message : 'Unable to get error message'
    // this.errors = []
  }

  getBody() {
    return {
      message: this.message,
    }
  }

  get httpCode() {
    return this._statusCode
  }
}
