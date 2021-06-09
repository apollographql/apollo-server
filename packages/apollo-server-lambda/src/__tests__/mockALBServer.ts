import url from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import {
  Context as LambdaContext,
  ALBHandler,
  ALBEvent,
  ALBResult,
} from 'aws-lambda';

export function createMockServer(handler: ALBHandler) {
  return (req: IncomingMessage, res: ServerResponse) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    // this is an unawaited async function, but anything that causes it to
    // reject should cause a test to fail
    req.on('end', async () => {
      const urlObject = url.parse(req.url || '', true);
      const queryStringParameters = Object.entries(urlObject.query)
        .map(([key, value]) => {
          return [key, encodeURIComponent(value as string)];
        })
        .reduce((acc, [key, value]) => ({ [key]: value, ...acc }), {});
      const event = {
        httpMethod: req.method,
        body: body,
        path: urlObject.pathname,
        queryStringParameters,
        requestContext: {
          elb: {},
        },
        headers: req.headers,
      };
      const result = (await handler(
        event as unknown as ALBEvent,
        {} as LambdaContext, // the fields aren't actually used now
        () => {
          throw Error("we don't use callback");
        },
      )) as ALBResult;
      res.statusCode = result.statusCode!;
      Object.entries(result.multiValueHeaders ?? {}).forEach(
        ([key, values]) => {
          res.setHeader(
            key,
            values.map((v) => v.toString()),
          );
        },
      );
      res.write(result.body);
      res.end();
    });
  };
}
