import {
  GraphQLRequest,
  GraphQLResponse,
  processGraphqlRequest,
} from '../../execution';
import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http';
import { GraphQLSchema } from 'graphql';

export interface HttpRequest {
  method: string;
  headers: IncomingHttpHeaders;
  url?: string;
  parsedRequest: GraphQLRequest;
}

export interface HttpResponse {
  /**
   * The numeric representation of the HTTP status code.
   */
  statusCode: number;
  /**
   * An optional string specification of the HTTP status code.
   *
   * @remarks
   *
   * For known status codes, it's recommended to use the IANA official names,
   * though handlers may define this as they wish.
   *
   * {@link https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml}
   */
  statusMessage?: string;
  /**
   * This returns an `AsyncIterable` which could include multiple responses.
   * It is up to the implementing HTTP handler to decide what it does with
   * this.
   */
  body: AsyncIterable<GraphQLResponse>;
  headers: OutgoingHttpHeaders;
}

/** Options for {@link processHttpRequest} */
interface IProcessHttpRequest {
  schema: GraphQLSchema;
  request: HttpRequest;
}

/**
 * Process an HTTP request.
 *
 * This is meant to be invoked from an HTTP handler which has
 * coerced its input values to match the interface expectations
 * of this
 *
 * @param args Options for HTTP request processing
 *
 * @returns {Promise<HttpResponse>} a `Promise` of an `HttpResponse`.  The
 * `body` of such a response
 */
export async function processHttpRequest(
  /**
   * This should be shaped by the HTTP framework adapter, into the expected
   * interface for this transport.
   */
  { schema, request }: IProcessHttpRequest,
): Promise<HttpResponse> {
  // Keep the transport-specific context, which we created above, separate.
  const response = await processGraphqlRequest({
    schema,
    request: request.parsedRequest,
  });

  /**
   * In the future, GraphQL execution should return an `AsyncIterable`. However,
   * today it returns a `Promise`, so we'll therefore coerce it into an
   * `AsyncIterable` through the use of a generator function which is
   * implemented on the `Symbol.asyncIterator` property.
   */
  const body = {
    [Symbol.asyncIterator]: async function*() {
      yield response;
    },
  };

  return {
    body,
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
    },
  };
}
