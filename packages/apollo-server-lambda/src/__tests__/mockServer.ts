import url from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Context as LambdaContext,
  Handler,
} from 'aws-lambda';

// Returns a Node http handler that invokes a Lambda handler as if via
// APIGatewayProxy with payload version 2.0.
export function createMockServer(
  handler: Handler<APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2>,
) {
  return (req: IncomingMessage, res: ServerResponse) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    // this is an unawaited async function, but anything that causes it to
    // reject should cause a test to fail
    req.on('end', async () => {
      const event = eventFromRequest(req, body);
      const result = (await handler(
        event,
        { functionName: 'someFunc' } as LambdaContext, // we don't bother with all the fields
        () => {
          throw Error("we don't use callback");
        },
      )) as APIGatewayProxyStructuredResultV2;
      res.statusCode = result.statusCode!;
      Object.entries(result.headers ?? {}).forEach(([key, value]) => {
        res.setHeader(key, value.toString());
      });
      res.write(result.body);
      res.end();
    });
  };
}

// Create an APIGatewayProxy V2 event from a Node request. Note that
// `@vendia/serverless-express` supports a bunch of different kinds of events
// including gateway V1, but for now we're just testing with this one. Based on
// https://github.com/vendia/serverless-express/blob/mainline/jest-helpers/api-gateway-v2-event.js
function eventFromRequest(
  req: IncomingMessage,
  body: string,
): APIGatewayProxyEventV2 {
  const urlObject = url.parse(req.url || '', false);
  return {
    version: '2.0',
    routeKey: '$default',
    rawQueryString: urlObject.search?.replace(/^\?/, '') ?? '',
    headers: Object.fromEntries(
      Object.entries(req.headers).map(([name, value]) => {
        if (Array.isArray(value)) {
          return [name, value.join(',')];
        } else {
          return [name, value];
        }
      }),
    ),
    // as of now, @vendia/serverless-express's v2
    // getRequestValuesFromApiGatewayEvent only looks at rawQueryString and
    // not queryStringParameters; for the sake of tests this is good enough.
    queryStringParameters: {},
    requestContext: {
      accountId: '347971939225',
      apiId: '6bwvllq3t2',
      domainName: '6bwvllq3t2.execute-api.us-east-1.amazonaws.com',
      domainPrefix: '6bwvllq3t2',
      http: {
        method: req.method!,
        path: req.url!,
        protocol: 'HTTP/1.1',
        sourceIp: '203.123.103.37',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
      },
      requestId: 'YuSJQjZfoAMESbg=',
      routeKey: '$default',
      stage: '$default',
      time: '06/Jan/2021:10:55:03 +0000',
      timeEpoch: 1609930503973,
    },
    isBase64Encoded: false,
    rawPath: urlObject.pathname!,
    body,
  };
}
