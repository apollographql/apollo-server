import fetch, { Response, RequestInit } from 'node-fetch';

const urlEtagMap: { [url: string]: string | null } = {};

export async function fetchIfNoneMatch(
  url: string,
  fetchOptions?: RequestInit,
): Promise<Response> {
  const previousEtag = urlEtagMap[url];

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      ...(fetchOptions && fetchOptions.headers),
      ...(previousEtag && { 'If-None-Match': previousEtag }),
    },
  });

  urlEtagMap[url] = response.headers.get('etag');
  return response;
}
