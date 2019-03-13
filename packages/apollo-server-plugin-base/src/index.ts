import { ValueOrPromise, WithRequired } from 'apollo-server-env';
import { GraphQLExtension } from 'graphql-extensions';
import {
  GraphQLServiceContext,
  GraphQLRequestContext,
  GraphQLRequest,
  GraphQLResponse,
  GraphQLExecutor,
} from 'apollo-server-core/dist/requestPipelineAPI';
export {
  GraphQLServiceContext,
  GraphQLRequestContext,
  GraphQLRequest,
  GraphQLResponse,
};

export interface ApolloServerPlugin {
  serverWillStart?(service: GraphQLServiceContext): ValueOrPromise<void>;
  requestDidStart?<TContext>(
    requestContext: GraphQLRequestContext<TContext>,
  ): GraphQLRequestListener<TContext> | void;
}

export interface GraphQLRequestListener<TContext = Record<string, any>> {
  didResolveDocumentText?(
    requestContext: WithRequired<
      GraphQLRequestContext<TContext>,
      'documentText' | 'queryHash' | 'metrics'
    >,
  ): ValueOrPromise<void>;
  parsingDidStart?(
    requestContext: GraphQLRequestContext<TContext>,
  ): (err?: Error) => void | void;
  validationDidStart?(
    requestContext: WithRequired<GraphQLRequestContext<TContext>, 'document'>,
  ): (err?: ReadonlyArray<Error>) => void | void;
  didResolveOperation?(
    requestContext: WithRequired<
      GraphQLRequestContext<TContext>,
      'document' | 'operationName' | 'operation'
    >,
  ): ValueOrPromise<void>;
  executor?: GraphQLExecutor<TContext>;
  executionDidStart?(
    requestContext: WithRequired<
      GraphQLRequestContext<TContext>,
      'document' | 'operationName' | 'operation'
    >,
  ): (err?: Error) => void | void;
  // Notably, these errors are the original GraphQLErrors, before being formatted
  // by hooks.
  didEncounterErrors?(
    requestContext: WithRequired<GraphQLRequestContext<TContext>, 'errors'>,
  ): ValueOrPromise<void>;
  willSendResponse?(
    requestContext: WithRequired<GraphQLRequestContext<TContext>, 'response'>,
  ): ValueOrPromise<void>;

  // If this is provided, apollo-server will install the returned object as a
  // graphql-extension extension. This is primarily intended for implementing
  // the willResolveField hook which does not yet exist in the plugin API.
  __graphqlExtension?(): GraphQLExtension<TContext>;
}
