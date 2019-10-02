import fetch, { RequestInit, Response } from 'node-fetch';

export interface CachedFetcherOptions {
  pollInterval?: number;
}

export class CachedFetcher {
  private logPrefix = 'CachedFetcher: ';
  private mapUrlToLastSuccessfulETag: { [url: string]: string } = Object.create(
    null,
  );
  private mapUrlToCachedResult: { [url: string]: any } = Object.create(null);

  async fetch(url: string) {
    const fetchOptions: RequestInit = {
      // GET is what we request, but keep in mind that, when we include and get
      // a match on the `If-None-Match` header we'll get an early return with a
      // status code 304.
      method: 'GET',
      headers: Object.create(null),
    };

    const lastSuccessfulETag = this.mapUrlToLastSuccessfulETag[url];
    if (lastSuccessfulETag) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'If-None-Match': lastSuccessfulETag,
      };
    }

    let response: Response;
    try {
      // TODO: Post-EA, implement more retry-ability
      response = await fetch(url, fetchOptions);
    } catch (error) {
      throw error;
    }

    /*
      Entity tags uniquely representing the requested resources.
      They are a string of ASCII characters placed between double quotes
      (Like "675af34563dc-tr34") and may be prefixed by W/ to indicate
      that the weak comparison algorithm should be used
      (This is useless with If-None-Match as it only uses that algorithm).
    */
    const receivedETag = response.headers.get('etag');
    // Cache hit, early return
    if (response.status === 304) {
      return { isCacheHit: true, result: this.mapUrlToCachedResult[url] };
    }

    if (!response.ok) {
      throw new Error(
        `${this.logPrefix}Could not fetch ${await response.text()}`,
      );
    }

    if (receivedETag) {
      this.mapUrlToLastSuccessfulETag[url] = receivedETag;
    }

    this.mapUrlToCachedResult[url] = await response.text();
    return { isCacheHit: false, result: this.mapUrlToCachedResult[url] };
  }

  getCache() {
    return this.mapUrlToCachedResult;
  }
}
