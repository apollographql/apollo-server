export function isDefined<T>(t: T | undefined | null | void): t is T {
  return t != null;
}
