import { IncomingMessage, RequestListener, ServerResponse } from "http";
import { IHttpRequest } from "./transport";
import { processHttpRequest } from "./transport";
import { GraphQLRequest, PromisifyReturnType } from "../../types";
import { ProcessGraphqlRequest } from "../../execution";

export type AsyncRequestListener = PromisifyReturnType<RequestListener>;

/**
 * A factory function that receives an instance of `ApolloServer` and returns a
 * `RequestHandler` that can be used with Node.js' `http.createServer`, or
 * Express' `app.use`.
 *
 * @param processGraphqlRequestFn - A method which will process a
 * `GraphQLRequest` and return a `GraphQLResponse`. It must itself understand
 * what schema to process this request against.
 */

export function httpHandler(
  processGraphqlRequestFn: ProcessGraphqlRequest,
): AsyncRequestListener {
  if (typeof processGraphqlRequestFn !== "function") {
    throw new Error("Invalid handler received: Pass the `executeOperation` " +
      "method from an instance of an `ApolloServer` to this function, or a " +
      "similar function which accepts a `GraphQLRequest` and returns a " +
      "`GraphQLResoonse`.");
  }

  /**
   * Returns the handler that can be passed to the HTTP framework that
   * respects the `(req, res)` pattern (e.g. Express or Node.js).
   */
  return async function httpRequestListener(req, res): Promise<void> {
    if (!req) {
      throw new Error("Missing request on HTTP request handler invocation.");
    }

    if (!res) {
      throw new Error(
        "Missing response sink on HTTP request handler invocation.");
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
      if (err instanceof SyntaxError) {
        return badRequest(res, "Malformed request body");
      }

      return internalServerError(res);
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
      processGraphqlRequestFn,
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
}

/**
 * Called in the event of a critical error within the HTTP handler.
 *
 * @param res
 * @param errorMessage
 */
function badRequest(
  res: ServerResponse,
  errorMessage: string = "Bad Request",
): void {
  res.writeHead(400, errorMessage);
  res.end()
}

/**
 * Called in the event of a critical error within the HTTP handler.
 *
 * @param res
 * @param errorMessage
 */
function internalServerError(
  res: ServerResponse,
  errorMessage: string = "Internal Server Error",
): void {
  res.writeHead(500, errorMessage);
  res.end()
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
 * @throws {SyntaxError}  A malformed request body that does not contain valid
 *                        JSON structure will cause `JSON.parse` to fail.  This
 *                        will result in a `SyntaxError` being thrown.
 *
 * @remarks
 *
 * TODO(AS3) Consider whether this implementation should be used as a getting
 * started experience that doesn't require an external package.
 *
 */
async function jsonBodyParse(req: IncomingMessage): Promise<GraphQLRequest> {
  const body: string = await new Promise((resolve, reject) => {
    const data: Uint8Array[] = [];
    req
      .on('data', chunk => data.push(chunk))
      .on('error', reject)
      .on('end', () => resolve(Buffer.concat(data).toString('utf-8')));
  });

  /**
   * First we'll parse the body, however this doesn't parse objects within
   * that body, like `variables` and `extensions`, which will need to be further
   * unwrapped from their JSON encoding to form a processable `GraphQLRequest`.
   * The blanks in this object will be filled in, as we parse those attributes.
   */
  const parsedBody: Partial<GraphQLRequest> = Object.create(null);

  // These will be parsed and added to the parsed body, when ready.
  let unparsedVariables: string, unparsedExtensions: string;

  /**
   * Destructure the initial parsing of the request body in order to find an
   * intermediate representation of a GraphQLRequest. Note that while the
   * `query` must not be parsed into a `DocumentNode` at this stage, the
   * `variables` and `extensions` should be parsed further with JSON.parse.
   * Any unspecfied properties will be `undefined`. We could exclude them
   * entirely, but for an internal data structure, this seems unnecessary.
   */
  ({
    query: parsedBody.query,
    operationName: parsedBody.operationName,
    variables: unparsedVariables,
    extensions: unparsedExtensions
  } = parseJsonInputAsObject<GraphQLRequest>(
    body,
    "Body is malformed JSON",
  ) || Object.create(null));

  parsedBody.variables = parseJsonInputAsObject(unparsedVariables,
    "Malformed JSON input for 'variables'");

  parsedBody.extensions = parseJsonInputAsObject(unparsedExtensions,
    "Malformed JSON input for 'extensions'");

  return parsedBody;
}

/**
 * Parse a JSON string and assert that it is in fact an object after parsing.
 *
 * @param input
 * @param errMsg
 */
function parseJsonInputAsObject<T>(
  input: string,
  errMsg: string,
): T | undefined {
  if (typeof input !== "string") {
    return;
  }

  try {
    const parsed = JSON.parse(input);
    if (typeof parsed !== "object") {
      throw new Error();
    }
    return parsed;
  } catch {
    throw new SyntaxError(errMsg);
  }
}

export const __testing__ = {
  badRequest,
  internalServerError,
  jsonBodyParse,
}
