import { Class } from '../utilities/types'

export interface Thrower<C extends Class<Error>> {
  /**
   * Create and throw the error.
   */
  (...args: ConstructorParameters<C>): never

  /**
   * Reference to the underlying class.
   */
  class: C
}

const hasCode = (o: any): o is { code: string } =>
  o && typeof o['code'] === 'string'

export function throws(code: string, message: string, Base?: Class<Error>): Thrower<Class<Error>>
export function throws<E extends Class<Error> & { code?: string }>(ErrorClass: E): Thrower<E>

export function throws<E extends Class<Error>>(
  codeOrClass: E | string,
  defaultMessage?: string,
  Base: Class<Error> = Error
): any {
  const ErrorClass = typeof codeOrClass === 'function'
    ? codeOrClass
    : class extends Base {
      static readonly code = codeOrClass
      constructor(message?: string, ...rest: any[]) {
        super(`${message ?? defaultMessage} (${codeOrClass})`, ...rest)
      }
    }

    if (hasCode(ErrorClass) && !('code' in ErrorClass.prototype))
      Object.defineProperty(ErrorClass.prototype, 'code', {
        value: ErrorClass.code, writable: true
      })

  return Object.assign(
    function(...args: ConstructorParameters<E>): never {
      throw new ErrorClass(...args)
    }, { class: ErrorClass }) as Thrower<E>
}

