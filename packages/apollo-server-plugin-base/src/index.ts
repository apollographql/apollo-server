import {
  GraphQLServiceContext,
  GraphQLRequestContext,
} from 'apollo-server-core/dist/requestPipelineAPI';
export { GraphQLServiceContext, GraphQLRequestContext };

type ValueOrPromise<T> = T | Promise<T>;

export abstract class ApolloServerPlugin {
  serverWillStart?(service: GraphQLServiceContext): ValueOrPromise<void>;
  requestDidStart?<TContext>(
    requestContext: GraphQLRequestContext<TContext>,
  ): GraphQLRequestListener<TContext> | void;
}

export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DidEndHook<TArgs extends any[]> = (...args: TArgs) => void;

export interface GraphQLRequestListener<TContext = Record<string, any>> {
  parsingDidStart?(
    requestContext: GraphQLRequestContext<TContext>,
  ): DidEndHook<[Error?]> | void;
  validationDidStart?(
    requestContext: WithRequired<GraphQLRequestContext<TContext>, 'document'>,
  ): DidEndHook<[ReadonlyArray<Error>?]> | void;
  didResolveOperation?(
    requestContext: WithRequired<
      GraphQLRequestContext<TContext>,
      'document' | 'operationName' | 'operation'
    >,
  ): ValueOrPromise<void>;
  executionDidStart?(
    requestContext: WithRequired<
      GraphQLRequestContext<TContext>,
      'document' | 'operationName' | 'operation'
    >,
  ): DidEndHook<[Error?]> | void;
  willSendResponse?(
    requestContext: WithRequired<GraphQLRequestContext<TContext>, 'response'>,
  ): ValueOrPromise<void>;
}
