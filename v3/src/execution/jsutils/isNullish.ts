/**
 * Portions of code within this module are leveraging code copied from the
 * `graphql-js` library and modified to suit the needs of Apollo Server. For
 * details regarding the terms of these modifications and any relevant
 * attributions for the existing code, see the LICENSE file, at the root of this
 * package.
 */

/**
 * Returns true if a value is null, undefined, or NaN.
 *
 * Note: TS doesn't capture NaN as a type, but this is functional at runtime.
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined || value !== value;
}
