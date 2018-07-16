import { fetch, Request, Response, Headers } from 'apollo-server-env';

import CachePolicy = require('http-cache-semantics');

import { KeyValueCache, InMemoryLRUCache } from 'apollo-server-caching';

interface CacheOptions {
  cacheKey: string;
}

export class HTTPCache {
  constructor(private keyValueCache: KeyValueCache = new InMemoryLRUCache()) {}

  async fetch(
    request: Request,
    options: CacheOptions = { cacheKey: request.url },
  ): Promise<Response> {
    const entry = await this.keyValueCache.get(`httpcache:${options.cacheKey}`);
    if (!entry) {
      const response = await fetch(request);

      const policy = new CachePolicy(
        policyRequestFrom(request),
        policyResponseFrom(response),
      );

      return this.storeResponseAndReturnClone(response, policy, options);
    }

    const { policy: policyRaw, body } = JSON.parse(entry);

    const policy = CachePolicy.fromObject(policyRaw);
    // Remove url from the policy, because otherwise it would never match a request with a custom cache key
    (policy as any)._url = undefined;

    if (policy.satisfiesWithoutRevalidation(policyRequestFrom(request))) {
      const headers = policy.responseHeaders();
      return new Response(body, {
        url: policy._url,
        status: policy._status,
        headers,
      });
    } else {
      const revalidationHeaders = policy.revalidationHeaders(
        policyRequestFrom(request),
      );
      const revalidationRequest = new Request(request, {
        headers: revalidationHeaders,
      });
      const revalidationResponse = await fetch(revalidationRequest);

      const { policy: revalidatedPolicy, modified } = policy.revalidatedPolicy(
        policyRequestFrom(revalidationRequest),
        policyResponseFrom(revalidationResponse),
      );

      return this.storeResponseAndReturnClone(
        modified
          ? revalidationResponse
          : new Response(body, {
              url: revalidatedPolicy._url,
              status: revalidatedPolicy._status,
              headers: revalidatedPolicy.responseHeaders(),
            }),
        revalidatedPolicy,
        options,
      );
    }
  }

  private async storeResponseAndReturnClone(
    response: Response,
    policy: CachePolicy,
    options: CacheOptions,
  ): Promise<Response> {
    if (!response.headers.has('Cache-Control') || !policy.storable())
      return response;

    const body = await response.text();
    const entry = JSON.stringify({
      policy: policy.toObject(),
      body,
    });

    let ttl = Math.round(policy.timeToLive() / 1000);
    // If a response can be revalidated, we don't want to remove it from the cache right after it expires.
    // We may be able to use better heuristics here, but for now we'll take the max-age times 2.
    if (canBeRevalidated(response)) {
      ttl *= 2;
    }
    await this.keyValueCache.set(`httpcache:${options.cacheKey}`, entry, {
      ttl,
    });

    // We have to clone the response before returning it because the
    // body can only be used once.
    // To avoid https://github.com/bitinn/node-fetch/issues/151, we don't use
    // response.clone() but create a new response from the consumed body
    return new Response(body, {
      url: response.url,
      status: response.status,
      statusText: response.statusText,
      headers: policy.responseHeaders(),
    });
  }
}

function canBeRevalidated(response: Response): boolean {
  return response.headers.has('ETag');
}

function policyRequestFrom(request: Request) {
  return {
    url: request.url,
    method: request.method,
    headers: headersToObject(request.headers),
  };
}

function policyResponseFrom(response: Response) {
  return {
    status: response.status,
    headers: headersToObject(response.headers),
  };
}

function headersToObject(headers: Headers) {
  const object = Object.create(null);
  for (const [name, value] of headers as Headers) {
    object[name] = value;
  }
  return object;
}
