import {
  GraphQLServiceContext,
  GraphQLRequestContext,
  GraphQLRequest,
  GraphQLResponse,
  ValueOrPromise,
  WithRequired,
  GraphQLRequestContextParsingDidStart,
  GraphQLRequestContextValidationDidStart,
  GraphQLRequestContextDidResolveOperation,
  GraphQLRequestContextDidEncounterErrors,
  GraphQLRequestContextResponseForOperation,
  GraphQLRequestContextExecutionDidStart,
  GraphQLRequestContextWillSendResponse,
} from 'apollo-server-types';

// We re-export all of these so plugin authors only need to depend on a single
// package.  The overall concept of `apollo-server-types` and this package
// is that they not depend directly on "core", in order to avoid close
// coupling of plugin support with server versions.  They are duplicated
// concepts right now where one package is intended to be for public plugin
// exposure, while the other (`-types`) is meant to be used internally.
// In the future, `apollo-server-types` and `apollo-server-plugin-base` will
// probably roll into the same "types" package, but that is not today!
export {
  GraphQLServiceContext,
  GraphQLRequestContext,
  GraphQLRequest,
  GraphQLResponse,
  ValueOrPromise,
  WithRequired,
  GraphQLRequestContextParsingDidStart,
  GraphQLRequestContextValidationDidStart,
  GraphQLRequestContextDidResolveOperation,
  GraphQLRequestContextDidEncounterErrors,
  GraphQLRequestContextResponseForOperation,
  GraphQLRequestContextExecutionDidStart,
  GraphQLRequestContextWillSendResponse,
};

export interface ApolloServerPlugin<TContext extends Record<string, any> = Record<string, any>> {
  serverWillStart?(service: GraphQLServiceContext): ValueOrPromise<void>;
  requestDidStart?(
    requestContext: GraphQLRequestContext<TContext>,
  ): GraphQLRequestListener<TContext> | void;
}

export interface GraphQLRequestListener<TContext = Record<string, any>> {
  parsingDidStart?(
    requestContext: GraphQLRequestContextParsingDidStart<TContext>,
  ): ((err?: Error) => void) | void;
  validationDidStart?(
    requestContext: GraphQLRequestContextValidationDidStart<TContext>,
  ): ((err?: ReadonlyArray<Error>) => void) | void;
  didResolveOperation?(
    requestContext: GraphQLRequestContextDidResolveOperation<TContext>,
  ): ValueOrPromise<void>;
  didEncounterErrors?(
    requestContext: GraphQLRequestContextDidEncounterErrors<TContext>,
  ): ValueOrPromise<void>;
  // If this hook is defined, it is invoked immediately before GraphQL execution
  // would take place. If its return value resolves to a non-null
  // GraphQLResponse, that result is used instead of executing the query.
  // Hooks from different plugins are invoked in series and the first non-null
  // response is used.
  responseForOperation?(
    requestContext: GraphQLRequestContextResponseForOperation<TContext>,
  ): ValueOrPromise<GraphQLResponse | null>;
  executionDidStart?(
    requestContext: GraphQLRequestContextExecutionDidStart<TContext>,
  ): ((err?: Error) => void) | void;
  willSendResponse?(
    requestContext: GraphQLRequestContextWillSendResponse<TContext>,
  ): ValueOrPromise<void>;
}
