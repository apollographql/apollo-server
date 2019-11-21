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
    setLocation(createRef, tag)
    return createRef

    function createRef(tag: TemplateStringsArray, ..._deps: any[]) {
      setLocation(tag)
      setLocation(ref, tag)
      return ref

      function ref(_value: T | Ref<T>) {

      }
    }
  }

export const __ref_testing__ = {
  createRefType
}

// const isTag = (o: any): o is TemplateStringsArray =>
//   o && Array.isArray(o) && (o as any).raw
