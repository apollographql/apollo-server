import { trace } from './pattern'
import { Ref, isRef } from './ref'

export function launch(plan: () => void) {
  const defs: Map<Ref<any>, Set<any>> = new Map

  for (const delta of trace(plan)) {
    const {mut, bond} = delta
    if (mut === 'add') {
      if (bond.type === 'def') {
        const {state: {ref, def}} = bond
        if (!defs.has(ref))
          defs.set(ref, new Set([def]))
        else
          defs.get(ref)!.add(def)
      }
    }
    // TODO (queerviolet): Handle change and delete deltas
  }

  const states: Map<Ref<any>, any> = new Map
  return once

  async function once<T>(ref: Ref<T>): Promise<T[]> {
    const existing = states.get(ref)
    if (existing) return existing

    const definitions = defs.get(ref)
    if (!definitions) return []

    const state: T[] = await Promise.all(
      [...definitions].map(d => isRef(d) ? once(d) : d)
    )
    states.set(ref, state)
    return state
  }
}
