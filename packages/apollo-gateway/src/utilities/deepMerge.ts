import { isObject } from './predicates';

export function deepMerge(target: any, source: any): any {
  if (source === undefined || source === null) return target;

  for (const key of Object.keys(source)) {
    if (source[key] === undefined || key === '__proto__') continue;

    if (target[key] && isObject(source[key])) {
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }

  return target;
}
