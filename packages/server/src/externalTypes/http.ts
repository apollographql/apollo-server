// TODO(AS4): Document this interface.
export interface HTTPGraphQLRequest {
  // capitalized (GET, POST, etc)
  method: string;
  // lowercase header name, multiple headers joined with ', ' like Headers.get
  // does
  headers: Map<string, string>;
  // no name normalization. can theoretically have deeply nested stuff if you
  // use a search parameter parser like `qs` (used by `express` by default) that does
  // that and you want to look for that in your own plugin. AS itself will only
  // look for a handful of keys and will validate their value types.
  searchParams: any;
  // read by your body-parser or whatever. we poke at it to make it into
  // the right real type.
  body: any;
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
  statusCode?: number;
  // need to figure out what headers this includes (eg JSON???)
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
