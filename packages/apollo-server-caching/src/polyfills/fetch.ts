declare namespace NodeJS {
  interface Global {
    fetch: typeof fetch;
    Request: typeof Request;
    Response: typeof Response;
    Headers: typeof Headers;
  }
}

if (!global.fetch) {
  const { default: fetch, Request, Response, Headers } = require('node-fetch');

  global.fetch = fetch;
  global.Request = Request;
  global.Response = Response;
  global.Headers = Headers;
}
