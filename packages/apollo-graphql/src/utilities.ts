// We'll only fetch the `ListIteratee` type from the `@types/lodash`, but get
// `sortBy` from the modularized version of the package to avoid bringing in
// all of `lodash`.
import { ListIteratee } from 'lodash';
import sortBy from 'lodash.sortby';

// Like lodash's sortBy, but sorted(undefined) === undefined rather than []. It
// is a stable non-in-place sort.
export function sorted<T>(
  items: ReadonlyArray<T> | undefined,
  ...iteratees: Array<ListIteratee<T>>
): Array<T> | undefined {
  if (items) {
    return sortBy(items, ...iteratees);
  }
  return undefined;
}
