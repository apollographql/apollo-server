import { ExecutionResult } from 'graphql';

export interface PersistedQueryCache {
  set(key: string, data: string): Promise<any>;
  get(key: string): Promise<string | null>;
}

export function calculateCacheControlHeaders(
  responses: Array<ExecutionResult & { extensions?: Record<string, any> }>,
) {
  let maxAge = Number.MAX_VALUE;
  let publicOrPrivate = 'public';

  //Because of the early exit, we are unable to use forEach. While a reduce
  //loop might be possible, a for loop is more readable
  for (let i = 0; i < responses.length; i++) {
    const response = responses[i];

    const cacheControl: {
      version: number;
      hints: Array<{ scope?: string; maxAge?: number; path: Array<string> }>;
    } =
      response.extensions && response.extensions.cacheControl;

    //If there are no extensions or hints, then the headers should not be present
    if (
      !cacheControl ||
      !cacheControl.hints ||
      cacheControl.hints.length === 0
    ) {
      return {};
    }

    const rootHints = new Set<string>();
    for (let y = 0; y < cacheControl.hints.length; y++) {
      if (cacheControl.hints[y].scope === 'PRIVATE') {
        publicOrPrivate = 'private';
      }

      //If no maxAge is present, then we ignore the hint
      if (cacheControl.hints[y].maxAge === undefined) {
        continue;
      }

      //if there is a hint with max age of 0, we don't need to process more
      if (cacheControl.hints[y].maxAge === 0) {
        return {};
      }

      if (cacheControl.hints[y].maxAge < maxAge) {
        maxAge = cacheControl.hints[y].maxAge;
      }

      rootHints.add(cacheControl.hints[y].path[0]);
    }

    //If a root field inside of data does not have a cache hint, then we do not
    //cache the response
    if (Object.keys(response.data).find(rootKey => !rootHints.has(rootKey))) {
      return {};
    }
  }

  return {
    'Cache-control': `max-age=${maxAge}, ${publicOrPrivate}`,
  };
}
