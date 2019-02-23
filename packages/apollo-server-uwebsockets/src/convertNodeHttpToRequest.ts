import { HttpRequest } from 'uWebSockets.js'
import { Request, Headers } from 'apollo-server-env';


export function convertNodeHttpToRequest(req: HttpRequest): Request {
  const headers = new Headers();

  // https://github.com/uNetworking/uWebSockets.js/issues/70
  // Object.keys(req.headers).forEach(key => {
  //   const values = req.headers[key]!;

  //   if (Array.isArray(values)) {
  //     values.forEach(value => headers.append(key, value));
  //   } else {
  //     headers.append(key, values);
  //   }
  // });

  return new Request(req.getQuery(), {
    headers,
    method: req.getMethod().toUpperCase(),
  });
}
