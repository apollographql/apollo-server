import {
  GraphQLServiceContext,
  GraphQLRequestContext,
} from 'apollo-server-core/dist/requestPipelineAPI';

export abstract class ApolloServerPlugin {
  serverWillStart?(service: GraphQLServiceContext): void;
  requestDidStart?<TContext>(
    requestContext: GraphQLRequestContext<TContext>,
  ): GraphQLRequestListener<TContext> | void;
}

// type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

export interface GraphQLRequestListener<TContext> {
  prepareRequest?(
    requestContext: GraphQLRequestContext<TContext>,
  ): Promise<void>;
  executionDidStart?(requestContext: GraphQLRequestContext<TContext>): void;
}
