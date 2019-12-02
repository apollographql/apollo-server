import { trace, Bond } from './pattern'
import { Ref, isRef, DEFAULT_BOND, getLabel } from './ref'
import { throws } from './errors'
import { getLocation } from './loc'

export type Plan = () => void

const E_ONLY = throws(class ReadOnlyOneError extends Error {
  static readonly code = 'ONLY'

  get message() {
    const {ref, defs} = this
    if (!defs.length) return `${ref} was never defined`
    return `${getLabel(ref)} was defined ${defs.length} times:\n${
      defs.map((def, i) => {
        const loc = getLocation(def.key)
        return `  ${i + 1}. at ${loc?.functionName ?? 'anonymous'} (${loc?.short})`
      }).join('\n')
    }`
  }
  constructor(public readonly ref: Ref<any>, public readonly defs: Bond[]) {
    super()
  }
})

const NO_BONDS = new Set<Bond>()
export class Core {
  private defs: Map<Ref<any>, Set<Bond>> = new Map

  constructor(public readonly plan: Plan) {
    this.link(plan)
  }

  link(plan: Plan) {
    const {defs} = this
    for (const delta of trace(plan)) {
      const {mut, bond} = delta
      if (mut === 'add') {
        if (bond.type === 'def') {
          const {state: {ref}} = bond
          if (!defs.has(ref))
            defs.set(ref, new Set([bond]))
          else
            defs.get(ref)!.add(bond)
        }
      }
      // TODO (queerviolet): Handle change and delete deltas
    }
  }

  states: Map<Ref<any>, any> = new Map

  resolveDefs(ref: Ref<any>): Set<Bond> {
    return this.defs.get(ref) || (
      typeof ref[DEFAULT_BOND] !== 'undefined' ? new Set([ref[DEFAULT_BOND]]) : NO_BONDS
    )
  }

  async once<T>(ref: Ref<T>): Promise<T[]> {
    const {states} = this

    const existing = states.get(ref)
    if (existing) return existing

    const definitions = this.resolveDefs(ref)

    const state: T[] = await Promise.all(
      [...definitions].map(({ state: {def} }) =>
        isRef(def) ? this.once(def) : def))

    states.set(ref, state)
    return state
  }

  async only<T>(ref: Ref<T>): Promise<T> {
    return this.once(ref).then(values => {
      if (values.length === 1) return values[0]
      throw E_ONLY(ref, [...this.resolveDefs(ref)])
    })
  }
}
