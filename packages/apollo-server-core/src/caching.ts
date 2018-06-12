import { ExecutionResult } from 'graphql';

export interface PersistedQueryCache {
  set(key: string, data: string): Promise<any>;
  get(key: string): Promise<string | null>;
}

export function calcualteCacheControlHeaders(
  responses: Array<ExecutionResult>,
) {
  let maxAge = Number.MAX_VALUE;
  let publicOrPrivate = 'public';

  for (let i = 0; i < responses.length; i++) {
    const cacheControl: {
      version: number;
      hints: Array<{ scope: string; maxAge: number }>;
    } =
      (responses[i] as Record<string, any>).extensions &&
      (responses[i] as Record<string, any>).extensions.cacheControl;

    if (!cacheControl) {
      return {};
    }

    for (let y = 0; y < cacheControl.hints.length; y++) {
      if (cacheControl.hints[y].scope === 'PRIVATE') {
        publicOrPrivate = 'private';
      }

      //if there is a hint with max age of 0, we don't need to process more
      if (cacheControl.hints[y].maxAge === 0) {
        return {};
      }

      if (cacheControl.hints[y].maxAge < maxAge) {
        maxAge = cacheControl.hints[y].maxAge;
      }
    }
  }

  return {
    'Cache-control': `max-age=${maxAge}, ${publicOrPrivate}`,
  };
}
