import { ValueType, ReferenceType, isReferenceType } from '../utilities/types'

export type NextTerminal<T> = (value: any, prev?: T) => T

/**
 * A WeakTrie maps sequences of objects and primitives to _terminals_—objects
 * or values which stably represent the sequence and can function as e.g. keys
 * in a Map. You configure a space of terminals by providing a `next` function
 * `NextTerminal<T> = (value: any, prev?: T) => T`.
 *
 * ⚠️**Important note**: Terminals **must not** store references to objects they
 * are created from. Doing so will result in a memory leak. (WeakTries
 * internally store objects in a WeakMap<input object, Terminal>. WeakMap
 * store weak references to their keys, and strong references to their values.
 * If the Terminal stores a reference to its input object, the input object
 * will never be collected.
 */
export class WeakTrie<T> {
  constructor(
    private readonly next: NextTerminal<T>,
    public readonly term: T,
    root?: WeakTrie<T>
  ) {
    this.root = root ? root : this
  }

  private readonly root: WeakTrie<T>

  getNode(item: any) {
    const map = isReferenceType(item) ? this.references : this.values
    const existing = map.get(item)
    if (existing) return existing
    const {next, root, term} = this
    const created = new WeakTrie<T>(next, next(item, term), root)
    map.set(item, created)
    return created
  }

  has(item: any) {
    const map = isReferenceType(item) ? this.references : this.values
    return map.has(item)
  }

  get(item: any) {
    return this.getNode(item).term
  }

  set(item: any, term: T): boolean {
    if (this.has(item))
      return false
    const map = isReferenceType(item) ? this.references : this.values
    const {next, root} = this
    const created = new WeakTrie<T>(next, term, root)
    map.set(item, created)
    return true
  }

  getIn(seq: any[]) {
    const {root} = this
    let node: WeakTrie<T> = this
    for (const item of seq) {
      const key = root.get(item)
      node = node.getNode(key)
    }
    return node.term
  }

  get values(): Map<ValueType, WeakTrie<T>> {
    const value: Map<ValueType, WeakTrie<T>> = new Map
    Object.defineProperty(this, 'values', {value})
    return value
  }

  get references(): WeakMap<ReferenceType, WeakTrie<T>> {
    const value: WeakMap<ReferenceType, WeakTrie<T>> = new WeakMap
    Object.defineProperty(this, 'references', {value})
    return value
  }
}
