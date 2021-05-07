import url from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import {
  APIGatewayProxyEvent,
  Context as LambdaContext,
  APIGatewayProxyResult,
} from 'aws-lambda';

export function createMockServer(
  handler: (
    event: APIGatewayProxyEvent,
    context: LambdaContext,
  ) => Promise<APIGatewayProxyResult>,
) {
  return (req: IncomingMessage, res: ServerResponse) => {
    // return 404 if path is /bogus-route to pass the test, lambda doesn't have paths
    if (req.url && req.url.includes('/bogus-route')) {
      res.statusCode = 404;
      return res.end();
    }

    let body = '';
    req.on('data', (chunk) => (body += chunk));
    // this is an unawaited async function, but anything that causes it to
    // reject should cause a test to fail
    req.on('end', async () => {
      const urlObject = url.parse(req.url || '', true);
      const event = {
        httpMethod: req.method,
        body: body,
        path: req.url,
        queryStringParameters: urlObject.query,
        requestContext: {
          path: urlObject.pathname,
        },
        headers: req.headers,
      } as APIGatewayProxyEvent; // cast because we don't bother with all the fields

      const result = await handler(
        event,
        {} as LambdaContext, // we don't bother with all the fields
      );
      res.statusCode = result.statusCode;
      for (let key in result.headers) {
        if (result.headers.hasOwnProperty(key)) {
          if (typeof result.headers[key] === 'boolean') {
            res.setHeader(key, result.headers[key].toString());
          } else {
            // Without casting this to `any`, TS still believes `boolean`
            // is possible.
            res.setHeader(key, result.headers[key] as any);
          }
        }
      }
      res.write(result.body);
      res.end();
    });
  };
}
