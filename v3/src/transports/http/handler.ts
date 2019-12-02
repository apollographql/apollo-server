import { IncomingMessage, RequestListener } from 'http';
import { HttpRequest } from './transport';
import { processHttpRequest } from './transport';
import { GraphQLRequest } from '../../execution';
import { GraphQLSchema } from "graphql";

/**
 * A factory function that receives an instance of `ApolloServer` and returns
 * a `RequestHandler` that can be used with Node.js' `http.createServer`, or
 * Express' `app.use`.
 *
 * @param apollo An instance of `ApolloServer`
 */
export const httpHandler: (
  schema: GraphQLSchema,
) => RequestListener = schema => {
  if (!(schema instanceof GraphQLSchema)) {
    throw new Error('Must pass an instance of ApolloServer');
  }

  /**
   * Returns the handler that can be passed to the HTTP framework that
   * respects the `(req, res)` pattern (e.g. Express or Node.js).
   */
  return async function httpRequestHandler(req, res): Promise<void> {
    let parsedRequest: GraphQLRequest;
    try {
      /**
       * TODO: Should probably validate, in a non-TypeScript way, that the
       * TODO: properties we expect to be there are present.
       */
      parsedRequest = await jsonBodyParse(req);
    } catch (err) {
      res.writeHead(500, 'Error parsing body.');
      return;
    }

    /**
     * Maps the incoming request to the shape that the Apollo HTTP transport
     * expects it to be in.
     */
    const httpGraphqlRequest: HttpRequest = {
      parsedRequest,
      url: req.url,
      headers: req.headers,
      // The `method` property, while optional in `http.IncomingMessage` type,
      // is guaranteed to be present on extensions of `http.Server` instances.
      method: req.method!,
    };

    const httpGraphqlResponse = await processHttpRequest({
      schema,
      request: httpGraphqlRequest,
    });

    // Map headers
    for (const [key, value] of Object.entries(httpGraphqlResponse.headers)) {
      res.setHeader(key, value || '');
    }

    // Map status codes
    res.statusCode = httpGraphqlResponse.statusCode;
    res.statusMessage = httpGraphqlResponse.statusMessage || '';

    // Map bodies
    //
    // Using `Readable.from(body)` would be great, and would allow a direct
    // pipe, but that's not supported until Node.js 12. Something from
    // `readable-stream` might be a suitable alternative.
    // https://www.npmjs.com/package/readable-stream
    for await (const chunkedHttpResponse of httpGraphqlResponse.body) {
      res.write(JSON.stringify(chunkedHttpResponse) + '\n\n');
    }
    res.end();
  };
};

/**
 * Take an `http.IncomingMessage` and translate it into a `GraphQLRequest` which
 * is suitable for consumption by the HTTP transport.  This is essentially a
 * replacement for using a more full-featured package like the popular
 * [`body-parser`](https://npm.im/body-parser) package.
 *
 * @param req The request from an `http.IncomingMessage` compatible interface.
 *            (Note that Express' `req` **is** compatible!)
 */
async function jsonBodyParse(req: IncomingMessage): Promise<GraphQLRequest> {
  const body: string = await new Promise(resolve => {
    const data: Uint8Array[] = [];
    req
      .on('data', chunk => data.push(chunk))
      .on('end', () => resolve(Buffer.concat(data).toString()));
  });

  // Values which are not present after the destructuring will be explicitly
  // `undefined`, but we may want to have them be absent entirely, though this
  // is an internal data structure, so perhaps unnecessary.
  const { query, operationName, variables, extensions } = JSON.parse(body);

  return {
    query,
    operationName,
    variables,
    extensions,
  };
}
