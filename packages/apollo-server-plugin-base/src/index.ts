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

type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

export interface GraphQLRequestListener<TContext> {
  prepareRequest?(requestContext: GraphQLRequestContext<TContext>): void;
  executionDidStart?(
    requestContext: WithRequired<GraphQLRequestContext<TContext>, 'operation'>,
  ): void;
}
