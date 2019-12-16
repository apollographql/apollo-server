import { IncomingMessage, RequestListener, ServerResponse } from "http";
import { IHttpRequest } from "./transport";
import { processHttpRequest } from "./transport";
import { GraphQLSchema } from "graphql";
import { GraphQLRequest } from "../../types";

/**
 * A factory function that receives an instance of `ApolloServer` and returns
 * a `RequestHandler` that can be used with Node.js' `http.createServer`, or
 * Express' `app.use`.
 *
 * @param schema  Presently, this requires a `GraphQLSchema`, though that should
 *                not be the case.  A correct implementation of this must
 *                either accept a function which is directly capable of
 *                executing a GraphQL operation, or a `class` which provides
 *                a known method which can be similarly executed upon (e.g.
 *                a `executeOperation` method).
 */
export const httpHandler: (
  schema: GraphQLSchema,
) => RequestListener = schema => {
  if (!(schema instanceof GraphQLSchema)) {
    throw new Error("Must pass a schema.");
  }

  /**
   * Returns the handler that can be passed to the HTTP framework that
   * respects the `(req, res)` pattern (e.g. Express or Node.js).
   */
  return async function httpRequestListener(req, res): Promise<void> {
    if (!req) {
      return responseAsInternalServerError(
        res,
        "Missing request on HTTP request handler invocation.",
      );
    }

    if (!res) {
      return responseAsInternalServerError(
        res,
        "Missing response sink on HTTP request handler invocation.",
      );
    }

    let parsedRequest: GraphQLRequest;
    try {
      /**
       * TODO: Need to assert at runtime that the properties we expect to
       * be there are present.
       */
      parsedRequest = await jsonBodyParse(req);
    } catch (err) {
      // TODO(AS3) In order to limit error codes to a single place, this may
      // be well-served to be a `GraphQLError`.
      return responseAsInternalServerError(res, "Error parsing body");
    }

    /**
     * Maps the incoming request to the shape that the Apollo HTTP transport
     * expects it to be in.
     */
    const httpGraphqlRequest: IHttpRequest = {
      parsedRequest,
      url: req.url,
      headers: req.headers,
      // The `method` property, while optional in `http.IncomingMessage` type,
      // is guaranteed to be present on extensions of `http.Server` instances.
      // Ref: https://git.io/JeM4V
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
 * Called in the event of a critical error within the HTTP handler.
 *
 * @param res 
 * @param errorMessage
 */
export function responseAsInternalServerError(
  res: ServerResponse,
  errorMessage: string,
): void {
  res.writeHead(500, errorMessage);
  return;
}

/**
 * Take an `http.IncomingMessage` and translate it into a `GraphQLRequest` which
 * is suitable for consumption by the HTTP transport.  This is a bare-bones
 * replacement for using a more full-featured package like the popular
 * [`body-parser`](https://npm.im/body-parser) package.  Of notable absence,
 * this method does nothing to strictly enforce body length limits, and has
 * no other error handling.  The `JSON.parse` will of course throw with
 * malformed input!
 *
 * @param req The request from an `http.IncomingMessage` compatible interface.
 *            (Note that Express' `req` **is** compatible!)
 *
 * @remarks
 *
 * TODO(AS3) Consider whether this implementation should be used as a getting
 * started experience that doesn't require an external package.
 *
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
