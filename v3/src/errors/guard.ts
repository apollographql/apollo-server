import { fail, FailureMode, Failure } from "./fail";
import { Class } from "../utilities/types";

const E_GUARD = fail('GUARD')

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

function use(failure: FailureMode | Failure<any>) {
  return 'create' in failure ? failure : failure()
}

export function guard(condition: any, failure: FailureMode | Failure<any> = E_GUARD): asserts condition {
  if (!condition) {
    throw use(failure).msg `Assertion failed`.create()
  }
}

export function check(lhs: any, op: Comparison, rhs: any, failure: FailureMode | Failure<any> = E_GUARD): boolean {
  if (op in COMPARE && COMPARE[op](lhs, rhs)) return true
  throw use(failure).msg `Assertion failed: ${lhs} ${op} ${rhs}`.create()
}

guard.instance = <R>(lhs: any, cls: Class<R>, failure: FailureMode | Failure<any> = E_GUARD): asserts lhs is R => {
  if (!(lhs instanceof cls)) {
    throw use(failure).msg `Assertion failed: ${lhs} instanceof ${cls.name}`.create()
  }
}

guard.check = check
