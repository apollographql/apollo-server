import type {
  GatewayGraphQLRequest,
  GatewayGraphQLRequestContext,
  GatewayGraphQLResponse,
  GatewaySchemaHash,
} from '@apollo/server-gateway-interface';
import type { FetcherHeaders } from '@apollo/utils.fetcher';
import type { ApolloServer, ApolloServerInternals } from '../ApolloServer';
import type {
  BaseContext,
  GraphQLRequestContextExecutionDidStart,
} from '../externalTypes';
import type { HeaderMap } from './HeaderMap';

// Apollo Gateway's API included `GraphQLRequestContext` from AS2/AS3.
// Specifically, a request context is passed to the main executor method, which
// it then exposes to user-configurable `GraphQLDataSource`s.
// `GraphQLRequestContext` has changed in incompatible ways in AS4; for example,
// we represent HTTP messages using our own data structures rather than Fetches,
// and some fields have been removed because they relate to features that don't
// exist any more.
//
// In general, the future of Apollo's development is in Apollo Router, not
// Gateway. So rather than have a big transition where a new version of Gateway
// supports AS4's GraphQLRequestContext instead of AS3's, we simply teach AS4
// how to produce AS3-style GraphQLRequestContext objects specifically for use
// by Gateway. We have changed Gateway to get its TS type definitions from a new
// package rather than from AS3 itself, so that Gateway no longer needs to
// depend on Apollo Server.
//
// This function turn an AS4 GraphQLRequestContext into a
// GatewayGraphQLRequestContext (which is basically an AS3
// GraphQLRequestContext).
//
// You might think that *after* invoking the executor, we would then need to
// propagate any changes made by the gateway back onto the "real"
// GraphQLRequestContext. It turns out that for each bit of data on the request
// context, this is either unnecessary or impossible. (We don't need to support
// use cases where people break type safe, eg by changing the values of readonly
// fields.) Here's why:
//
// Many fields on GatewayGraphQLRequestContext are declared readonly and their
// values are taken directly from the real GraphQLRequestContext. This means
// that gateways should not change the field's value, and any mutations of the
// object stored in the field (say, calling
// `requestContext.overallCachePolicy.restrict`, as RemoteGraphQLDataSource
// does) already take effect.
//
//  The only two fields not declared as readonly are `logger` and `debug`.
//
// Technically, a gateway implementation could set `requestContext.logger` to a
// different Logger without breaking the TypeScript declarations. In AS4 we
// don't actually have a requestContext.logger; we have `readonly
// requestContext.server` and `readonly server.logger`. So there's not an easy
// way for us to carry out this change: AS4 just doesn't let gateway or plugins
// override the server's logger (and generally doesn't allow the logger to
// change after the server is created), which seems like a simpler model. If it
// turns out there is a real use case for the gateway to be able to change the
// overall logger for the request as seen by plugins, we can fix that later.
//
// Similarly, it's not clear what the intended use case of mutating `debug` in
// gateway would be. `debug` has now mostly changed into
// `includeStacktraceInErrorResponses`. So perhaps this could be used to let you
// decide whether or not to include the stacktrace on a per-operation basis...
// but you can also use `formatError` or `didEncounterErrors` for this perhaps?
// In any case, AS4 doesn't track `includeStacktraceInErrorResponses` on a
// per-operation basis; if we find a use case for this we can add it later.
//
// So we'll just ignore changes to `logger` and `debug`.
//
// Next, there's `request`. We don't know of a use case for mutating the
// *request* at execution time. If there was a real use case, we could add a
// function that copies pieces back from the gateway `request` to the AS4
// request, but we're not bothering to yet.
//
// Finally, there's `response`. Sure, the executor *could* mutate `response`.
// But the main thing the executor is doing is *returning* a response, which
// then semi-overwrites `requestContext.response` anyway. So it doesn't seem
// like we need to support `executor` *also* overwriting response. Yet again, we
// can fix this if it turns out it's necessary. (That said, the executor could
// in theory write HTTP response headers or status, so we make sure to hook them
// up directly to the appropriate data in the real GraphQLRequestContext.)
//
// So all in all, it looks like it's OK for this to be a "one-way" conversion.
export function makeGatewayGraphQLRequestContext<TContext extends BaseContext>(
  as4RequestContext: GraphQLRequestContextExecutionDidStart<TContext>,
  server: ApolloServer<TContext>,
  internals: ApolloServerInternals<TContext>,
): GatewayGraphQLRequestContext {
  const request: GatewayGraphQLRequest = {};
  if ('query' in as4RequestContext.request) {
    request.query = as4RequestContext.request.query;
  }
  if ('operationName' in as4RequestContext.request) {
    request.operationName = as4RequestContext.request.operationName;
  }
  if ('variables' in as4RequestContext.request) {
    request.variables = as4RequestContext.request.variables;
  }
  if ('extensions' in as4RequestContext.request) {
    request.extensions = as4RequestContext.request.extensions;
  }
  if (as4RequestContext.request.http) {
    const as4http = as4RequestContext.request.http;
    const needQuestion =
      as4http.search !== '' && !as4http.search.startsWith('?');
    request.http = {
      method: as4http.method,
      // As of AS4, we no longer attempt to track complete URLs (just the search
      // parameters used in GET requests). So we have to fake them for Gateway.
      url: `https://unknown-url.invalid/${needQuestion ? '?' : ''}${
        as4http.search
      }`,
      headers: new FetcherHeadersForHeaderMap(as4http.headers),
    };
  }

  const response: GatewayGraphQLResponse = {
    http: {
      headers: new FetcherHeadersForHeaderMap(
        as4RequestContext.response.http.headers,
      ),
      get status() {
        return as4RequestContext.response.http.status;
      },
      set status(newStatus) {
        as4RequestContext.response.http.status = newStatus;
      },
    },
    // We leave off `body` because it hasn't been set yet.
  };

  return {
    request,
    response,
    logger: server.logger,
    schema: as4RequestContext.schema,
    // For the sake of typechecking, we still provide this field, but we don't
    // calculate it. If somebody really needs it in their gateway
    // implementation, they're welcome to copy
    // https://github.com/apollographql/apollo-server/blob/3f218e78/packages/apollo-server-core/src/utils/schemaHash.ts
    // into their code.
    schemaHash:
      'schemaHash no longer exists in Apollo Server 4' as GatewaySchemaHash,
    context: as4RequestContext.contextValue,
    cache: server.cache,
    queryHash: as4RequestContext.queryHash,
    document: as4RequestContext.document,
    source: as4RequestContext.source,
    operationName: as4RequestContext.operationName,
    operation: as4RequestContext.operation,
    errors: as4RequestContext.errors,
    metrics: as4RequestContext.metrics,
    debug: internals.includeStacktraceInErrorResponses,
    overallCachePolicy: as4RequestContext.overallCachePolicy,
    requestIsBatched: as4RequestContext.requestIsBatched,
  };
}

// An implementation of the W3C-style headers class used by Gateway (and AS3),
// backed by AS4's HeaderMap. Changes are written directly to the HeaderMap, so
// any concurrent writes to the underlying HeaderMap (eg from a plugin) can be
// seen immediately by the gateway and vice versa.
class FetcherHeadersForHeaderMap implements FetcherHeaders {
  constructor(private map: HeaderMap) {}
  append(name: string, value: string) {
    if (this.map.has(name)) {
      this.map.set(name, this.map.get(name) + ', ' + value);
    } else {
      this.map.set(name, value);
    }
  }
  delete(name: string) {
    this.map.delete(name);
  }
  get(name: string): string | null {
    return this.map.get(name) ?? null;
  }
  has(name: string): boolean {
    return this.map.has(name);
  }
  set(name: string, value: string) {
    this.map.set(name, value);
  }
  entries(): Iterator<[string, string]> {
    return this.map.entries();
  }
  keys(): Iterator<string> {
    return this.map.keys();
  }
  values(): Iterator<string> {
    return this.map.values();
  }
  [Symbol.iterator](): Iterator<[string, string]> {
    return this.map.entries();
  }
}
