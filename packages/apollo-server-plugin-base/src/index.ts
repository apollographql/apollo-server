import {
  GraphQLServiceContext,
  GraphQLRequestContext,
  GraphQLRequest,
  GraphQLResponse,
} from 'apollo-server-core/dist/requestPipelineAPI';
export {
  GraphQLServiceContext,
  GraphQLRequestContext,
  GraphQLRequest,
  GraphQLResponse,
};

type ValueOrPromise<T> = T | Promise<T>;

export interface ApolloServerPlugin {
  serverWillStart?(service: GraphQLServiceContext): ValueOrPromise<void>;
  requestDidStart?<TContext>(
    requestContext: GraphQLRequestContext<TContext>,
  ): GraphQLRequestListener<TContext> | void;
}

export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

export interface GraphQLRequestListener<TContext = Record<string, any>> {
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
  executionDidStart?(
    requestContext: WithRequired<
      GraphQLRequestContext<TContext>,
      'document' | 'operationName' | 'operation'
    >,
  ): (err?: Error) => void | void;
  willSendResponse?(
    requestContext: WithRequired<GraphQLRequestContext<TContext>, 'response'>,
  ): ValueOrPromise<void>;
}
