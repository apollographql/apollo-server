import { Ref } from './ref'
import keys, { keyed, Key, Keyed } from './key'

export interface Bond {
  type: string
  ref: Ref<any>
}

export type Pattern = Bond[]

let current: Bond[] | void = void 0

export function link(bond: Bond) {
  if (!current)
    throw new Error('No pattern is currently bound')
  current.push(bond)
}

export function trace(plan: () => any): Pattern {
  const pattern: Bond[] = []
  try {
    current = pattern
    plan()
  } finally {
    current = void 0
    return pattern
  }
}

type CreateBond = (...args: any[]) => Bond
export const linked = <B extends CreateBond>(create: B): Keyed<(key?: Key) => B> => keyed(
  (key?: Key) => (
    (...args: any[]) => {
      const bond = create(...args)
      key && keys.set(bond, key)
      link(bond)
      return bond
    }
  ) as B
)

export const def = linked(
  <T>(ref: Ref<T>, def: T | Ref<T>) =>
    ({ type: 'def', ref, def })
)
