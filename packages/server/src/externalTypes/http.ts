/**
 * This file exports types related to GraphQL execution with respect to HTTP.
 * These types define the inputs and outputs for `executeHTTPGraphQLRequest` and
 * are most interesting for integration authors.
 */
import type { HeaderMap } from '../utils/HeaderMap.js';

export interface HTTPGraphQLRequest {
  // capitalized (GET, POST, etc)
  method: string;
  // lowercase header name, multiple headers joined with ', ' like Headers.get
  // does
  headers: HeaderMap;
  /**
   * The part of the URL after the question mark (not including the #fragment),
   * or the empty string if there is no question mark. Including the question
   * mark in this string is allowed but not required. Do not %-decode this
   * string. You can get this from a standard Node request with
   * `url.parse(request.url).search ?? ''`.
   */
  search: string;
  // read by your body-parser or whatever. we poke at it to make it into
  // the right real type.
  body: unknown;
}

export interface HTTPGraphQLHead {
  status?: number;
  headers: HeaderMap;
}

/**
 * Here we use `string`s for the response body since the response can be either
 * HTML (for the landing page - see `executeHTTPGraphQLRequest`) or JSON (for a
 * GraphQL response). Based on `headers` and `method` on the request, we know
 * how to correctly interpret the response body.
 */
export type HTTPGraphQLResponseBody =
  | { kind: 'complete'; string: string }
  | { kind: 'chunked'; asyncIterator: AsyncIterableIterator<string> };

export type HTTPGraphQLResponse = HTTPGraphQLHead & {
  body: HTTPGraphQLResponseBody;
};
