import { fail, FailureMode, Failure } from "./fail";
import { Class } from "../utilities/types";

const E_GUARD = fail('GUARD')
const E_CHECK = fail('CHECK')

export type Comparison = '<' | '>' | '==' | '===' | '!=' | '!==' | '<=' | '>='
const COMPARE = {
  '<': (lhs: any, rhs: any) => lhs < rhs,
  '>': (lhs: any, rhs: any) => lhs > rhs,
  '==': (lhs: any, rhs: any) => lhs == rhs,
  '===': (lhs: any, rhs: any) => lhs === rhs,
  '!=': (lhs: any, rhs: any) => lhs != rhs,
  '!==': (lhs: any, rhs: any) => lhs !== rhs,
  '<=': (lhs: any, rhs: any) => lhs <= rhs,
  '>=': (lhs: any, rhs: any) => lhs >= rhs,
}

export type ToThrow = FailureMode | Failure<any>

function use(toThrow: ToThrow) {
  return 'create' in toThrow ? toThrow : toThrow()
}

export function guard(condition: any, failure: ToThrow = E_GUARD): asserts condition {
  if (!condition) {
    throw use(failure).msg `Guard failed`.create()
  }
}

export function check(lhs: any, op: Comparison, rhs: any, failure: ToThrow = E_CHECK): boolean {
  if (op in COMPARE && COMPARE[op](lhs, rhs)) return true
  throw use(failure).msg `Check failed: ${lhs} ${op} ${rhs}`.create()
}

check.instance = <R>(lhs: any, cls: Class<R>, failure: ToThrow = E_CHECK): asserts lhs is R => {
  if (!(lhs instanceof cls)) {
    throw use(failure).msg `Check failed: ${lhs} instanceof ${cls.name}`.create()
  }
}

check.exists = (o: any, failure: ToThrow = E_CHECK): o is Exclude<any, null | undefined> => {
  if (o == null) {
    throw use(failure).msg `Check failed: ${o} exists`.create()
  }
  return true
}
