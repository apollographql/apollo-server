import { Request, RequestInit, Headers } from 'apollo-server-env';

// Make this file a module
// See: https://github.com/microsoft/TypeScript/issues/17736
export {};
declare global {
  namespace jest {
    interface Matchers<R, T> {
      toHaveFetched(spy: SpyInstance): R;
    }
  }
}

type ExtendedRequest = RequestInit & { url: string };

function prepareHttpRequest(request: ExtendedRequest): Request {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  if (request.headers) {
    for (let name in request.headers) {
      headers.set(name, request.headers[name]);
    }
  }

  const options: RequestInit = {
    method: 'POST',
    headers,
    body: JSON.stringify(request.body),
  };

  return new Request(request.url, options);
}

function toHaveFetched(
  this: jest.MatcherUtils,
  fetch: jest.SpyInstance,
  request: ExtendedRequest,
): { message(): string; pass: boolean } {
  const httpRequest = prepareHttpRequest(request);
  let pass = false;
  let message = () => '';
  try {
    expect(fetch).toBeCalledWith(httpRequest);
    pass = true;
  } catch (e) {
    message = () => e.message;
  }

  return {
    message,
    pass,
  };
}

function toHaveFetchedNth(
  this: jest.MatcherUtils,
  fetch: jest.SpyInstance,
  nthCall: number,
  request: ExtendedRequest,
): { message(): string; pass: boolean } {
  const httpRequest = prepareHttpRequest(request);
  let pass = false;
  let message = () => '';
  try {
    expect(fetch).toHaveBeenNthCalledWith(nthCall, httpRequest);
    pass = true;
  } catch (e) {
    message = () => e.message;
  }

  return {
    message,
    pass,
  };
}


expect.extend({
  toHaveFetched,
  toHaveFetchedNth,
});
