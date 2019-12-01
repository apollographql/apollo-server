import { trace } from './pattern'
import { Ref, isRef, DEFAULT_VALUE } from './ref'

type Plan = () => void
export class Core {
  private defs: Map<Ref<any>, Set<any>> = new Map

  constructor(public readonly plan: Plan) {
    this.link(plan)
  }

  link(plan: Plan) {
    const {defs} = this
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
  }

  states: Map<Ref<any>, any> = new Map

  async once<T>(ref: Ref<T>): Promise<T[]> {
    const {defs, states} = this

    const existing = states.get(ref)
    if (existing) return existing

    const definitions = defs.get(ref) || (typeof ref[DEFAULT_VALUE] !== 'undefined' ? [ref[DEFAULT_VALUE]] : [])
    if (!definitions) return []

    const state: T[] = await Promise.all(
      [...definitions].map(d => isRef(d) ? this.once(d) : d)
    )
    states.set(ref, state)
    return state
  }

  async only<T>(ref: Ref<T>): Promise<T> {
    return this.once(ref).then(values => {
      if (values.length === 1) return values[0]
      throw new Error(`ref \`${ref}\` was defined ${values.length} times`)
    })
  }
}
