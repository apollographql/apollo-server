import { fail, FailureMode, Failure } from "./fail";
import { Class, AnyFunc } from "../utilities/types";

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

check.string = (o: any, failure: ToThrow = E_CHECK): o is string => {
  if (typeof o !== "string") {
    throw use(failure).msg `Check failed: ${String(o)} is string`.create()
  }
  return true
}

check.number = (o: any, failure: ToThrow = E_CHECK): o is number => {
  if (typeof o !== "number") {
    throw use(failure).msg `Check failed: ${String(o)} is number`.create()
  }
  return true
}

check.boolean = (o: any, failure: ToThrow = E_CHECK): o is boolean => {
  if (typeof o !== "boolean") {
    throw use(failure).msg `Check failed: ${String(o)} is boolean`.create()
  }
  return true
}

check.symbol = (o: any, failure: ToThrow = E_CHECK): o is symbol => {
  if (typeof o !== "symbol") {
    throw use(failure).msg `Check failed: ${String(o)} is symbol`.create()
  }
  return true
}

check.undefined = (o: any, failure: ToThrow = E_CHECK): o is undefined => {
  if (typeof o !== "undefined") {
    throw use(failure).msg `Check failed: ${String(o)} is undefined`.create()
  }
  return true
}

check.object = (o: any, failure: ToThrow = E_CHECK): o is object => {
  if (!o || typeof o !== "object") {
    throw use(failure).msg `Check failed: ${String(o)} is object`.create()
  }
  return true
}

check.function = (o: any, failure: ToThrow = E_CHECK): o is AnyFunc => {
  if (typeof o !== "function") {
    throw use(failure).msg `Check failed: ${String(o)} is function`.create()
  }
  return true
}
