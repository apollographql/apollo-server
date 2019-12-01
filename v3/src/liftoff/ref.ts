import { setLocation } from './loc'

export interface RefType<T> {
  <X extends T=T>(tag: TemplateStringsArray, ...deps: any[]): (defaultValue?: X | Ref<X>) => Ref<X>
}

export const DEFAULT_VALUE = Symbol('Ref<T>::[DEFAULT_VALUE]: T | void')
export interface Ref<T> {
  [DEFAULT_VALUE]: T | Ref<T> | void
}

function createScalarType<T>
  (tag: TemplateStringsArray, ..._deps: any[]): RefType<T> {
    setLocation(tag)
    setLocation(createRef, tag)
    return createRef

    function createRef<X extends T>(tag: TemplateStringsArray, ..._deps: any[]) {
      setLocation(tag)
      return create

      function create(defaultValue?: X | Ref<X>): Ref<X> {
        return new Scalar<X>(tag, defaultValue)
      }
    }
  }

class Scalar<T> implements Ref<T> {
  public readonly label: string

  constructor(tag: TemplateStringsArray, public readonly defaultValue?: T | Ref<T>) {
    setLocation(this, tag)
    refsByTag.set(tag, this)
    this.label = tag.join('___')
    refLabels.set(this, this.label)
    allRefs.add(this)
  }

  toString() { return this.label }

  get [DEFAULT_VALUE]() { return this.defaultValue }
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
