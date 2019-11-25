import { setLocation } from './loc'

export interface RefType<T> {
  (tag: TemplateStringsArray, ...deps: any[]): Ref<T>
}

export interface Ref<T> {
  (value: T | Ref<T>): void
}

function createRefType<T>
  (tag: TemplateStringsArray, ..._deps: any[]): RefType<T> {
    setLocation(tag)
    setLocation(findOrCreate, tag)
    return findOrCreate

    function findOrCreate(tag: TemplateStringsArray, ...deps: any[]) {
      setLocation(tag)
      return refsByTag.get(tag) || createRef(tag, ...deps)
    }

    function createRef(tag: TemplateStringsArray, ..._deps: any[]) {
      setLocation(ref, tag)
      refsByTag.set(tag, ref)
      refLabels.set(ref, tag.join('___'))
      return ref

      function ref(_value: T | Ref<T>) {

      }
    }
  }

const refLabels = new WeakMap<Ref<any>, string>()
const refsByTag = new WeakMap<any, Ref<any>>()

export const str = createRefType <string> `string`
export const obj = createRefType <object> `object`
export const int = createRefType <number> `int`
export const float = createRefType <number> `float`
export const bool = createRefType <boolean> `boolean`

export const __ref_testing__ = {
  createRefType
}
