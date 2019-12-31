import { Class, Instance, isTemplateInvocation } from '../utilities/types'

export function fail
  (code: string): FailureMode<[]>
export function fail<P extends any[], M extends FailureMode<P, any>>
  (code: string, mode: M): M
export function fail<E extends Class<Error>>
  (code: string, Base: E): FailureMode<ConstructorParameters<E>, Instance<E>>
export function fail<E extends ErrorWithStaticCode>
  (Base: E): FailureMode<ConstructorParameters<E>, Instance<E>>

export function fail<E extends ErrorWithStaticCode>(
  codeOrBase: E | string,
  ...rest: any[]
): any {
  let code: string
  let Base: Class<Error>
  if (typeof codeOrBase === 'string') {
    code = codeOrBase
    Base = rest[1] || Error
  } else {
    Base = rest[0]
    code = codeOrBase.code
  }

  return failureMode(Base, code)
}


export type Message<P extends any[]> = [string] | [(...params: P) => string] | [TemplateStringsArray, ...any[]]

export type Fail<P extends any[], Base extends Error> = Base & {
  readonly code: string
  readonly params: P
}

export interface FailureMode<P extends any[] = [object?], Base extends Error = Error> {
  (...params: P): Failure<P, Base>
  readonly code: string
  class: Class<Fail<P, Base>> & (new (fromFailure: Failure<P, Base>) => Fail<P, Base>)
  message: <MoreProps=undefined>(...msg: Message<[MoreProps]>) =>
    P extends []
      ? MoreProps extends object
        ? FailureMode<[MoreProps], Base>
        : FailureMode<P, Base>
      :
    P extends [infer Props]
      ? MoreProps extends object
        ? FailureMode<[Props & MoreProps], Base>
        : FailureMode<P, Base>
      :
      FailureMode<P, Base>
}

export interface Failure<P extends any[], Base extends Error> {
  create(): Fail<P, Base>
  readonly messages: Message<P>[]
}

export class Failure<P extends any[], Base extends Error> {
  constructor(
    public readonly mode: FailureMode<P, Base>,
    public readonly params: P,
    public readonly messages: Message<P>[] = []) {}

  create(): Fail<P, Base> {
    return new this.mode.class(this)
  }
}

export interface ErrorWithStaticCode extends Class<Error> {
  readonly code: string
}

function formatMsg<P extends any[]>(message: Message<P>, params: P) {
  if (!message.length) return null
  const [format] = message
  console.log('format:', format)
  if (typeof format === 'function') {
    console.log(format, params)
    return format(...params)
  }
  if (isTemplateInvocation(message)) return String.raw(...message)
  if (typeof format === 'string') return format
  return null
}

const FAILURE_CODE = Symbol('Failure code')

function failureMode<B extends Class<Error>>(Base: B, code: string, ...messages: Message<ConstructorParameters<B>>[]): FailureMode<ConstructorParameters<B>, Instance<B>> {
  const FailureClass = ((Base as any)[FAILURE_CODE] === code) ? Base :
    class FailureClass extends Base {
      static readonly [FAILURE_CODE] = code
      static readonly code = code
      public readonly failure: Failure<ConstructorParameters<B>, Instance<B>>

      constructor(...args: any[]) {
        const [failure] = args as [Failure<ConstructorParameters<B>, Instance<B>>]
        super(...failure.params)
        this.failure = failure
      }

      get message() {
        if (!super.message && !this.failure.messages.length) return code
        return [
          super.message,
          ...this.failure.messages.map(m => formatMsg(m, this.failure.params))
        ].filter(Boolean).join('\n\n')
      }
    }

  function FailureMode(...args: ConstructorParameters<B>) {
    return new Failure(FailureMode as any, args, messages)
  }

  Object.defineProperties(FailureClass, {
    name: { value: code },
  })

  Object.defineProperties(FailureMode, {
    code: {value: code},
    message: {
      value(...message: Message<ConstructorParameters<B>>) {
        return failureMode(FailureClass, code, ...messages, message)
      }
    }
  })

  FailureMode.prototype = Object.create(FailureClass.prototype)
  FailureMode.prototype.constructor = FailureMode

  return FailureMode as any
}
