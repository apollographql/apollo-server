import { CacheManager } from 'make-fetch-happen';
import { Request, Response, Headers } from 'apollo-server-env';
import { InMemoryLRUCache } from 'apollo-server-caching';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function cacheKey(request: Request) {
  return `gateway:request-cache:${request.method}:${request.url}`;
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
    let body = await response.text();

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
