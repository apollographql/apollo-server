import { ExecutionResult } from 'graphql';
import { CacheControlFormat } from 'apollo-cache-control';

export function calculateCacheControlHeaders(
  responses: Array<ExecutionResult & { extensions?: Record<string, any> }>,
): Record<string, string> {
  let lowestMaxAge = Number.MAX_VALUE;
  let publicOrPrivate = 'public';

  for (const response of responses) {
    const cacheControl: CacheControlFormat =
      response.extensions && response.extensions.cacheControl;

    // If there are no extensions or hints, then the headers should not be present
    if (
      !cacheControl ||
      !cacheControl.hints ||
      cacheControl.hints.length === 0 ||
      cacheControl.version !== 1
    ) {
      if (cacheControl && cacheControl.version !== 1) {
        console.warn('Invalid cacheControl version.');
      }
      return {};
    }

    const rootHints = new Set<string>();
    for (const hint of cacheControl.hints) {
      if (hint.scope && hint.scope.toLowerCase() === 'private') {
        publicOrPrivate = 'private';
      }

      // If no maxAge is present, then we ignore the hint
      if (hint.maxAge === undefined) {
        continue;
      }

      // if there is a hint with max age of 0, we don't need to process more
      if (hint.maxAge === 0) {
        return {};
      }

      if (hint.maxAge < lowestMaxAge) {
        lowestMaxAge = hint.maxAge;
      }

      // If this is a root path, store that the root is cacheable:
      if (hint.path.length === 1) {
        rootHints.add(hint.path[0] as string);
      }
    }

    // If a root field inside of data does not have a cache hint, then we do not
    // cache the response
    if (
      response.data &&
      Object.keys(response.data).find(rootKey => !rootHints.has(rootKey))
    ) {
      return {};
    }
  }

  return {
    'Cache-Control': `max-age=${lowestMaxAge}, ${publicOrPrivate}`,
  };
}
