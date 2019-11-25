import { WeakTrie, NextTerminal } from './weak-trie'
import { isTemplateStringsArray } from '../utilities/types'
import { setLocation } from './loc'

export interface Key {
  id: number
  description?: string
}

let nextId = 0
const createKey = (description?: string) => ({
  id: nextId++,
  description,
})

const nextKey: NextTerminal<Key> = (value: any, prev?: Key) =>
  createKey((prev ? prev.description : '') + String(value))

const Empty = createKey('Empty')
const Null = createKey('Null')
const Undefined = createKey('Undefined')

export const keys = new WeakTrie<Key>(nextKey, Empty)
keys.set(null, Null)
keys.set(undefined, Undefined)

export default keys

export type Keyable = (key?: Key) => any
export type Keyed<F extends Keyable> =
  ((parts: TemplateStringsArray, ...subs: any[]) => ReturnType<F>) & ReturnType<F>

export const keyed = <F extends Keyable>(func: F): Keyed<F> => {
  const keyless = func()
  return (
    (...args: any[]) => {
      const [first] = args
      if (isTemplateStringsArray(first)) {
        setLocation(first)
        return func(keys.getIn(args)).apply(undefined, args)
      }
      return keyless.apply(undefined, args)
    }
  ) as any
}
