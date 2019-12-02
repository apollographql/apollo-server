import { setLocation, getLocation } from './loc'
import { keyed } from './key'
import { def, Bond, trace } from './pattern'

export interface ScalarType<T> {
  <X extends T=T>(tag: TemplateStringsArray, ...deps: any[]): (defaultValue?: X | Ref<X>) => Scalar<X>
}


export const DEFAULT_VALUE = Symbol('Default value, if any // Ref<T>::[DEFAULT_VALUE]: T | Ref<T>')
export const DEFAULT_BOND = Symbol('Bond for default value // Bond')
export interface Ref<T> {
  [DEFAULT_VALUE]: T | Ref<T> | void
  [DEFAULT_BOND]: Bond
}

export interface Scalar<T> extends Ref<T> {
  (value: T | Ref<T>): void
  (tag: TemplateStringsArray, ...deps: any[]): (value: T | Ref<T>) => void

  def(value: T | Ref<T>): void
  def(tag: TemplateStringsArray, ...deps: any[]): (value: T | Ref<T>) => void
}


function createScalarType<T>
  (tag: TemplateStringsArray, ..._deps: any[]): ScalarType<T> {
    setLocation(tag, 2)
    setLocation(createRef, tag)
    const typeLabel = tag.join('___')
    return createRef

    function createRef<X extends T>(tag: TemplateStringsArray, ...deps: any[]) {
      setLocation(tag, 2)
      const label = tag.join('___')
      return create

      function create(defaultValue?: X | Ref<X>): Scalar<X> {
        const define: Scalar<X> = keyed(key => (value: X | Ref<X>) => {
          def (key.site, ...key.deps) (define) (value)
        }) as any

        const defaultBond = typeof defaultValue !== 'undefined'
          ? trace(() => def (tag, ...deps) (define) (defaultValue))[0].bond
          : undefined

        Object.defineProperties(define, {
          [DEFAULT_VALUE]: {
            value: defaultValue,
          },
          [DEFAULT_BOND]: {
            value: defaultBond
          },
          toString: {
            value() { return `${label} <${typeLabel}> (${getLocation(this)?.short})` },
          },
          def: {
            value: define,
          },
        })

        setLocation(define, tag)
        refsByTag.set(tag, define)
        refLabels.set(define, label)
        refTypeLabels.set(define, typeLabel)
        allRefs.add(define)

        return define
      }
    }
  }


export function getLabel(ref: object) {
  return refLabels.get(ref)
}

export function getTypeLabel(ref: object) {
  return refTypeLabels.get(ref)
}

const refLabels = new WeakMap<any, string>()
const refTypeLabels = new WeakMap<any, string>()
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
