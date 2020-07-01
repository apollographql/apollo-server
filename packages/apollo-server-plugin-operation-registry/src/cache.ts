import { CacheManager } from 'make-fetch-happen';
import { Request, Response, Headers } from 'apollo-server-env';
import { InMemoryLRUCache } from 'apollo-server-caching';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function cacheKey(request: Request) {
  return `op-reg:request-cache:${request.method}:${request.url}`;
}

interface CachedRequest {
    body: string;
    status: number;
    statusText: string;
    headers: Headers;
}

export class HttpRequestCache implements CacheManager {
  constructor(
    public cache: InMemoryLRUCache<CachedRequest> = new InMemoryLRUCache({
      maxSize: MAX_SIZE,
    }),
  ) {}

  // Return true if entry exists, else false
  async delete(request: Request) {
    const key = cacheKey(request);
    const entry = await this.cache.get(key);
    await this.cache.delete(key);
    return Boolean(entry);
  }

  async put(request: Request, response: Response) {
    // A `HEAD` request has no body to cache and a 304 response could have
    // only been negotiated by using a cached body that was still valid.
    // Therefore, we do NOT write to the cache in either of these cases.
    // Without avoiding this, we will invalidate the cache, thus causing
    // subsequent conditional requests (e.g., `If-None-Match: "MD%") to be
    // lacking content to conditionally request against and necessitating
    // a full request/response.
    if (request.method === "HEAD" || response.status === 304) {
      return response;
    }

    const body = await response.text();

    this.cache.set(cacheKey(request), {
      body,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });

    return new Response(body, response);
  }

  async match(request: Request) {
    return this.cache.get(cacheKey(request)).then(response => {
      if (response) {
        const { body, ...requestInit } = response;
        return new Response(body, requestInit);
      }
      return;
    });
  }
}
