import url from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import {
  APIGatewayProxyCallback,
  APIGatewayProxyEvent,
  Context as LambdaContext,
  Handler,
  APIGatewayProxyResult
} from "aws-lambda";

export function createMockServer(handler: Handler<APIGatewayProxyEvent, APIGatewayProxyResult>) {
  return (req: IncomingMessage, res: ServerResponse) => {
    // return 404 if path is /bogus-route to pass the test, lambda doesn't have paths
    if (req.url && req.url.includes('/bogus-route')) {
      res.statusCode = 404;
      return res.end();
    }

    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
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
      };
      const callback: APIGatewayProxyCallback = (error, result) => {
        if (error) {
          throw error;
        } else {
          result = result as NonNullable<typeof result>;
        }
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
      };

      handler(
        event as APIGatewayProxyEvent,
        {} as LambdaContext,
        callback as APIGatewayProxyCallback
      );
    });
  };
};
