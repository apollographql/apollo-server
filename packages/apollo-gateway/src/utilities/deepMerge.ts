import { isObject } from './predicates';

export function deepMerge(target: any, source: any): any {
  if (source === undefined || source === null) return target;

  for (const key of Object.keys(source)) {
    if (source[key] === undefined || key === '__proto__') continue;

    if (target[key] && isObject(source[key])) {
      deepMerge(target[key], source[key]);
    } else if (
      Array.isArray(source[key]) &&
      Array.isArray(target[key]) &&
      source[key].length === target[key].length
    ) {
      let i = 0;
      for (; i < source[key].length; i++) {
        if (isObject(target[key][i]) && isObject(source[key][i])) {
          deepMerge(target[key][i], source[key][i]);
        } else {
          target[key][i] = source[key][i];
        }
      }
    } else {
      target[key] = source[key];
    }
  }

  return target;
}
