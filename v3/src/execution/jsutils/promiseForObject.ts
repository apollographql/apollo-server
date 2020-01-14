/**
 * Portions of code within this module are leveraging code copied from the
 * `graphql-js` library and modified to suit the needs of Apollo Server. For
 * details regarding the terms of these modifications and any relevant
 * attributions for the existing code, see the LICENSE file, at the root of this
 * package.
 */

import { ObjMap } from '.';

/**
 * This function transforms a JS object `ObjMap<Promise<T>>` into
 * a `Promise<ObjMap<T>>`
 *
 * This is akin to bluebird's `Promise.props`, but implemented only using
 * `Promise.all` so it will work with any implementation of ES6 promises.
 */
export function promiseForObject<T>(
  object: ObjMap<Promise<T>>,
): Promise<ObjMap<T>> {
  const keys = Object.keys(object);
  const valuesAndPromises = keys.map(name => object[name]);
  return Promise.all(valuesAndPromises).then(values =>
    values.reduce((resolvedObject, value, i) => {
      resolvedObject[keys[i]] = value;
      return resolvedObject;
    }, Object.create(null)),
  );
}
