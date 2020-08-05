/**
 * Portions of code within this module are leveraging code copied from the
 * `graphql-js` library and modified to suit the needs of Apollo Server. For
 * details regarding the terms of these modifications and any relevant
 * attributions for the existing code, see the LICENSE file, at the root of this
 * package.
 */

export const nodejsCustomInspectSymbol =
  typeof Symbol === 'function' && typeof Symbol.for === 'function'
    ? Symbol.for('nodejs.util.inspect.custom')
    : undefined;
