import { setLocation } from './loc'
import { keyed } from './key'
import { def } from './pattern'

export interface ScalarType<T> {
  <X extends T=T>(tag: TemplateStringsArray, ...deps: any[]): (defaultValue?: X | Ref<X>) => Scalar<X>
}


export const DEFAULT_VALUE = Symbol('Ref<T>::[DEFAULT_VALUE]: T | void')
export interface Ref<T> {
  [DEFAULT_VALUE]: T | Ref<T> | void
}

export interface Scalar<T> extends Ref<T> {
  (value: T | Ref<T>): void
  (tag: TemplateStringsArray, ...deps: any[]): (value: T | Ref<T>) => void

  def(value: T | Ref<T>): void
  def(tag: TemplateStringsArray, ...deps: any[]): (value: T | Ref<T>) => void
}


function createScalarType<T>
  (tag: TemplateStringsArray, ..._deps: any[]): ScalarType<T> {
    setLocation(tag)
    setLocation(createRef, tag)
    return createRef

    function createRef<X extends T>(tag: TemplateStringsArray, ..._deps: any[]) {
      setLocation(tag)
      const label = tag.join('___')
      return create

      function create(defaultValue?: X | Ref<X>): Scalar<X> {
        const define: Scalar<X> = keyed(key => (value: X | Ref<X>) => {
          def (key.site, ...key.deps) (define) (value)
        }) as any

        Object.defineProperties(define, {
          [DEFAULT_VALUE]: {
            value: defaultValue,
            configurable: false,
            writable: false,
          },
          toString: {
            value() { return label },
            configurable: false,
            writable: false,
          },
          def: {
            value: define,
            configurable: false,
            writable: false,
          },
        })

        setLocation(define, tag)
        refsByTag.set(tag, define)
        refLabels.set(define, label)
        allRefs.add(define)

        return define
      }
    }
  }

const refLabels = new WeakMap<Ref<any>, string>()
const refsByTag = new WeakMap<any, Ref<any>>()
const allRefs = new WeakSet<Ref<any>>()

export const isRef = <T>(o: any): o is Ref<T> => allRefs.has(o)

export const str = createScalarType <string> `string`
export const obj = createScalarType <object> `object`
export const int = createScalarType <number> `int`
export const float = createScalarType <number> `float`
export const bool = createScalarType <boolean> `boolean`
export const func = createScalarType <Function> `function`

export const __ref_testing__ = {
  createScalarType
}
