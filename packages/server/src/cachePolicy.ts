import type { CacheHint, CachePolicy } from '@apollo/cache-control-types';
import ms from 'ms';

export function newCachePolicy(): CachePolicy {
  return {
    maxAge: undefined,
    scope: undefined,
    restrict(hint: CacheHint) {
      // If the max age is passed in as a human readable string, we'll first attempt to convert it to a number
      if (hint.maxAge !== undefined && typeof hint.maxAge === 'string') {
        const parsedFromHumanReadable = ms(hint.maxAge); // Convert human-readable format to milliseconds
        if (parsedFromHumanReadable) {
          hint.maxAge = parsedFromHumanReadable / 1000; // If it was valid, convert to seconds
        }
      }

      if (
        hint.maxAge !== undefined &&
        (this.maxAge === undefined || hint.maxAge < this.maxAge)
      ) {
        this.maxAge = hint.maxAge;
      }
      if (hint.scope !== undefined && this.scope !== 'PRIVATE') {
        this.scope = hint.scope;
      }
    },
    replace(hint: CacheHint) {
      // If the max age is passed in as a human readable string, we'll first attempt to convert it to a number
      if (hint.maxAge !== undefined && typeof hint.maxAge === 'string') {
        const parsedFromHumanReadable = ms(hint.maxAge); // Convert human-readable format to milliseconds
        if (parsedFromHumanReadable) {
          hint.maxAge = parsedFromHumanReadable / 1000; // If it was valid, convert to seconds
        }
      }

      if (hint.maxAge !== undefined) {
        this.maxAge = hint.maxAge;
      }
      if (hint.scope !== undefined) {
        this.scope = hint.scope;
      }
    },
    policyIfCacheable() {
      if (this.maxAge === undefined || this.maxAge === 0) {
        return null;
      }
      return { maxAge: this.maxAge, scope: this.scope ?? 'PUBLIC' };
    },
  };
}
