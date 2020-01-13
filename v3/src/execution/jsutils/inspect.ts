/**
 * Portions of code within this module are leveraging code copied from the
 * `graphql-js` library and modified to suit the needs of Apollo Server. For
 * details regarding the terms of these modifications and any relevant
 * attributions for the existing code, see the LICENSE file, at the root of this
 * package.
 */

import { nodejsCustomInspectSymbol } from './nodejsCustomInspectSymbol';

const MAX_ARRAY_LENGTH = 10;
const MAX_RECURSIVE_DEPTH = 2;

/**
 * Used to print values in error messages.
 */
export function inspect(value: unknown): string {
  return formatValue(value, []);
}

function formatValue<T>(value: T, seenValues: T[]): string {
  switch (typeof value) {
    case 'string':
      return JSON.stringify(value);
    case 'function':
      return value.name ? `[function ${value.name}]` : '[function]';
    case 'object':
      if (value === null) {
        return 'null';
      }
      return formatObjectValue(value, seenValues);
    default:
      return String(value);
  }
}

function formatObjectValue<T>(value: T, previouslySeenValues: T[]): string {
  if (previouslySeenValues.indexOf(value) !== -1) {
    return '[Circular]';
  }

  const seenValues = [...previouslySeenValues, value];
  const customInspectFn = getCustomFn(value);

  if (customInspectFn !== undefined) {
    // $FlowFixMe(>=0.90.0)
    const customValue = customInspectFn.call(value);

    // check for infinite recursion
    if (customValue !== value) {
      return typeof customValue === 'string'
        ? customValue
        : formatValue(customValue, seenValues);
    }
  } else if (Array.isArray(value)) {
    return formatArray(value, seenValues);
  }

  return formatObject(value, seenValues);
}

function formatObject<T extends Record<string, any>>(object: T, seenValues: T[]): string {
  const keys = Object.keys(object);
  if (keys.length === 0) {
    return '{}';
  }

  if (seenValues.length > MAX_RECURSIVE_DEPTH) {
    return '[' + getObjectTag(object) + ']';
  }

  const properties = keys.map(key => {
    const value = formatValue(object[key], seenValues);
    return key + ': ' + value;
  });

  return '{ ' + properties.join(', ') + ' }';
}

// TODO: struggling to replace these `any`s with type variables
// Best attempt: formatArray<U, T extends U[]>(array: T, seenValues: T[])
function formatArray(array: any, seenValues: any): string {
  if (array.length === 0) {
    return '[]';
  }

  if (seenValues.length > MAX_RECURSIVE_DEPTH) {
    return '[Array]';
  }

  const len = Math.min(MAX_ARRAY_LENGTH, array.length);
  const remaining = array.length - len;
  const items = [];

  for (let i = 0; i < len; ++i) {
    items.push(formatValue(array[i], seenValues));
  }

  if (remaining === 1) {
    items.push('... 1 more item');
  } else if (remaining > 1) {
    items.push(`... ${remaining} more items`);
  }

  return '[' + items.join(', ') + ']';
}

// TODO: get rid of this `any`.
// This is troublesome because getCustomFn is expected to be called on an object,
// but if you notice the callsite, `object` could be an Array as well. TS doesn't
// like this idea of trying to access an array's index by string and throws an error.
function getCustomFn(object: any) {
  const customInspectFn = object[String(nodejsCustomInspectSymbol)];

  if (typeof customInspectFn === 'function') {
    return customInspectFn;
  }

  if (typeof object.inspect === 'function') {
    return object.inspect;
  }
}

function getObjectTag<T extends Record<string, any>>(object: T): string {
  const tag = Object.prototype.toString
    .call(object)
    .replace(/^\[object /, '')
    .replace(/]$/, '');

  if (tag === 'Object' && typeof object.constructor === 'function') {
    const name = object.constructor.name;
    if (typeof name === 'string' && name !== '') {
      return name;
    }
  }

  return tag;
}
