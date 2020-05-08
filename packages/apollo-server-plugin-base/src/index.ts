import {
  AnyFunctionMap,
  BaseContext,
  GraphQLServiceContext,
  GraphQLRequestContext,
  GraphQLRequest,
  GraphQLResponse,
  ValueOrPromise,
  WithRequired,
  GraphQLFieldResolverParams,
  GraphQLRequestContextDidResolveSource,
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
  BaseContext,
  GraphQLServiceContext,
  GraphQLRequestContext,
  GraphQLRequest,
  GraphQLResponse,
  ValueOrPromise,
  WithRequired,
  GraphQLFieldResolverParams,
  GraphQLRequestContextDidResolveSource,
  GraphQLRequestContextParsingDidStart,
  GraphQLRequestContextValidationDidStart,
  GraphQLRequestContextDidResolveOperation,
  GraphQLRequestContextDidEncounterErrors,
  GraphQLRequestContextResponseForOperation,
  GraphQLRequestContextExecutionDidStart,
  GraphQLRequestContextWillSendResponse,
};

export interface ApolloServerPlugin<
  TContext extends BaseContext = BaseContext
> {
  serverWillStart?(service: GraphQLServiceContext): ValueOrPromise<void>;
  requestDidStart?(
    requestContext: GraphQLRequestContext<TContext>,
  ): GraphQLRequestListener<TContext> | void;
}

export type GraphQLRequestListenerParsingDidEnd = (err?: Error) => void;
export type GraphQLRequestListenerValidationDidEnd =
  ((err?: ReadonlyArray<Error>) => void);
export type GraphQLRequestListenerExecutionDidEnd = ((err?: Error) => void);
export type GraphQLRequestListenerDidResolveField =
  ((error: Error | null, result?: any) => void);

export interface GraphQLRequestListener<
  TContext extends BaseContext = BaseContext
> extends AnyFunctionMap {
  didResolveSource?(
    requestContext: GraphQLRequestContextDidResolveSource<TContext>,
  ): ValueOrPromise<void>;
  parsingDidStart?(
    requestContext: GraphQLRequestContextParsingDidStart<TContext>,
  ): GraphQLRequestListenerParsingDidEnd | void;
  validationDidStart?(
    requestContext: GraphQLRequestContextValidationDidStart<TContext>,
  ): GraphQLRequestListenerValidationDidEnd | void;
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
  ):
    | GraphQLRequestExecutionListener
    | GraphQLRequestListenerExecutionDidEnd
    | void;
  willSendResponse?(
    requestContext: GraphQLRequestContextWillSendResponse<TContext>,
  ): ValueOrPromise<void>;
}

export interface GraphQLRequestExecutionListener<
  TContext extends BaseContext = BaseContext
> extends AnyFunctionMap {
  executionDidEnd?: GraphQLRequestListenerExecutionDidEnd;
  willResolveField?(
    fieldResolverParams: GraphQLFieldResolverParams<any, TContext>
  ): GraphQLRequestListenerDidResolveField | void;
}
