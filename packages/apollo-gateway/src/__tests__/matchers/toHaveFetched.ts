import { Request, RequestInit, Headers } from 'apollo-server-env';

// Make this file a module
// See: https://github.com/microsoft/TypeScript/issues/17736
export {};
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveFetched(spy: SpyInstance): R;
    }
  }
}

function toHaveFetched(
  this: jest.MatcherUtils,
  fetch: jest.SpyInstance,
  request: RequestInit & { url: string },
): { message(): string; pass: boolean } {
  let headers = new Headers();
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

  const httpRequest = new Request(request.url, options);

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

expect.extend({
  toHaveFetched,
});
