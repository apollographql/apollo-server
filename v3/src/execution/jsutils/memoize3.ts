/**
 * Portions of code within this module are leveraging code copied from the
 * `graphql-js` library and modified to suit the needs of Apollo Server. For
 * details regarding the terms of these modifications and any relevant
 * attributions for the existing code, see the LICENSE file, at the root of this
 * package.
 */

/**
 * Memoizes the provided three-argument function.
 */
type MemoArg = {[key: string]: any} | readonly any[];

export function memoize3<
  T extends MemoArg,
  U extends MemoArg,
  V extends MemoArg,
  R
>(fn: (A1: T, A2: U, A3: V) => R): (A1: T, A2: U, A3: V) => R {
  let cache0: WeakMap<any, any> | undefined;

  function memoized(a1: T, a2: U, a3: V) {
    if (!cache0) {
      cache0 = new WeakMap();
    }
    let cache1 = cache0.get(a1);
    let cache2;
    if (cache1) {
      cache2 = cache1.get(a2);
      if (cache2) {
        const cachedValue = cache2.get(a3);
        if (cachedValue !== undefined) {
          return cachedValue;
        }
      }
    } else {
      cache1 = new WeakMap();
      cache0.set(a1, cache1);
    }
    if (!cache2) {
      cache2 = new WeakMap();
      cache1.set(a2, cache2);
    }
    const newValue = fn(a1, a2, a3);
    cache2.set(a3, newValue);
    return newValue;
  }

  return memoized;
}
