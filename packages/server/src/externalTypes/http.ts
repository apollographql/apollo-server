// TODO(AS4): Document this interface.
export interface HTTPGraphQLRequest {
  // capitalized (GET, POST, etc)
  method: string;
  // lowercase header name, multiple headers joined with ', ' like Headers.get
  // does
  headers: Map<string, string>;
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

// TODO(AS4): Should this be exported for integrations?
interface HTTPGraphQLResponseChunk {
  // TODO(AS4): is it reasonable to make users have to lowercase keys? should
  // we write our own Headers class? would prefer to not use a specific node-fetch
  // implementation in AS4.
  headers: Map<string, string>;
  body: string;
}

export interface HTTPGraphQLHead {
  status?: number;
  // TODO(AS4): need to figure out what headers this includes (eg JSON???)
  headers: Map<string, string>;
}

export type HTTPGraphQLResponse = HTTPGraphQLHead &
  (
    | {
        // TODO(AS4): document why we chose strings as output. (tl;dr: consistent
        // rather than flexible JSON output. Can represent landing page. We can
        // always add another entry point that returns un-serialized responses
        // later.)
        completeBody: string;
        bodyChunks: null;
      }
    | {
        completeBody: null;
        bodyChunks: AsyncIterableIterator<HTTPGraphQLResponseChunk>;
      }
  );
