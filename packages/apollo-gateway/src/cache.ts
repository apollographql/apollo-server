import { URL, format } from 'url';
import { Request, Response } from 'apollo-server-env';
import { InMemoryLRUCache } from 'apollo-server-caching';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * @see: https://github.com/npm/make-fetch-happen/blob/master/cache.js
 */
function cacheKey(request: Request) {
  const parsed = new URL(request.url);
  const key = `gateway:request-cache:${format({
    protocol: parsed.protocol,
    slashes: true,
    port: parsed.port,
    hostname: parsed.hostname,
    pathname: parsed.pathname,
  })}`;
  return key;
}

export class Cache {
  constructor(
    public cache: InMemoryLRUCache<string> = new InMemoryLRUCache({
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

    this.cache.set(
      cacheKey(request),
      JSON.stringify({
        body,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers.raw(),
      }),
    );

    return new Response(body, response);
  }

  async match(request: Request) {

    return this.cache.get(cacheKey(request)).then(response => {
      if (response) {
        const {body, ...requestInit} = JSON.parse(response);
        return new Response(body, requestInit);
      }
      return;
    });
  }
}
