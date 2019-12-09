/**
 * Portions of code within this module are leveraging code copied from the
 * `graphql-js` library and modified to suit the needs of Apollo Server. For
 * details regarding the terms of these modifications and any relevant
 * attributions for the existing code, see the LICENSE file, at the root of this
 * package.
 */

import { isPromise } from '.';
import { PromiseOrValue } from 'graphql/jsutils/PromiseOrValue';

/**
 * Similar to Array.prototype.reduce(), however the reducing callback may return
 * a Promise, in which case reduction will continue after each promise resolves.
 *
 * If the callback does not return a Promise, then this function will also not
 * return a Promise.
 */
export function promiseReduce<T, U>(
  values: readonly T[],
  callback: (previous: U, value: T) => PromiseOrValue<U>,
  initialValue: PromiseOrValue<U>,
): PromiseOrValue<U> {
  return values.reduce(
    (previous, value) =>
      isPromise(previous)
        ? previous.then(resolved => callback(resolved, value))
        : callback(previous, value),
    initialValue,
  );
}
