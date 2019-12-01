import { Plugin, Config, Refs } from 'pretty-format'
import { isRef, Ref, getLabel, getTypeLabel, getLocation } from '../liftoff'

export default {
  test(value: any) {
    return isRef(value)
  },

  serialize(
    value: Ref<any>,
    _config: Config,
    _indentation: string,
    _depth: number,
    _refs: Refs,
    _printer: any,
  ): string {
    return `${getLabel(value)} <${getTypeLabel(value)}> (${getLocation(value)?.short})`
  },
} as Plugin
