import { IncomingMessage } from 'http';
import { Request, Headers } from 'apollo-server-env';

export function convertNodeHttpToRequest(req: IncomingMessage): Request {
  const headers = new Headers();
  const headerKeys = Object.keys(req.headers);
  const validHeaderKeys = headerKeys.filter(key => !key.startsWith(':'));
  validHeaderKeys.forEach(key => {
    const values = req.headers[key]!;
    if (Array.isArray(values)) {
      values.forEach(value => headers.append(key, value));
    } else {
      headers.append(key, values);
    }
  });

  return new Request(req.url!, {
    headers,
    method: req.method,
  });
}
