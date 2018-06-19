import CachePolicy from 'http-cache-semantics';

import { KeyValueCache } from './KeyValueCache';
import { InMemoryKeyValueCache } from './InMemoryKeyValueCache';

export class HTTPCache {
  constructor(
    private keyValueCache: KeyValueCache = new InMemoryKeyValueCache(),
  ) {}

  async fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const request = new Request(input, init);

    const cacheKey = cacheKeyFor(request);

    const entry = await this.keyValueCache.get(cacheKey);
    if (!entry) {
      const response = await fetch(request);

      const policy = new CachePolicy(
        policyRequestFrom(request),
        policyResponseFrom(response),
      );

      return this.storeResponseAndReturnClone(request, response, policy);
    }

    const { policy: policyRaw, body } = JSON.parse(entry);

    const policy = CachePolicy.fromObject(policyRaw);

    if (policy.satisfiesWithoutRevalidation(policyRequestFrom(request))) {
      const headers = policy.responseHeaders();
      return new Response(body, { status: policy._status, headers });
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
        revalidationRequest,
        modified
          ? revalidationResponse
          : new Response(body, {
              status: revalidatedPolicy._status,
              headers: revalidatedPolicy.responseHeaders(),
            }),
        revalidatedPolicy,
      );
    }
  }

  private async storeResponseAndReturnClone(
    request: Request,
    response: Response,
    policy: CachePolicy,
  ): Promise<Response> {
    if (!response.headers.has('Cache-Control') || !policy.storable())
      return response;

    const cacheKey = cacheKeyFor(request);

    const body = await response.text();
    const entry = JSON.stringify({ policy: policy.toObject(), body });

    await this.keyValueCache.set(cacheKey, entry);

    // We have to clone the response before returning it because the
    // body can only be used once.
    // To avoid https://github.com/bitinn/node-fetch/issues/151, we don't use
    // response.clone() but create a new response from the consumed body
    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: policy.responseHeaders(),
    });
  }
}

function cacheKeyFor(request: Request): string {
  // FIXME: Find a way to take Vary header fields into account when computing a cache key
  // Although we do validate header fields and don't serve responses from cache when they don't match,
  // new reponses overwrite old ones with different vary header fields.
  // (I think we have similar heuristics in the Engine proxy)
  return `httpcache:${request.url}`;
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
