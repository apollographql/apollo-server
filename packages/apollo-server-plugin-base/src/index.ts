import {
  GraphQLRequestContext,
  GraphQLRequest,
} from 'apollo-server-core/dist/requestPipelineAPI';
import { OperationDefinitionNode } from 'graphql';

export abstract class ApolloServerPlugin {
  serverWillStart?(): void;
  requestDidStart?<TContext>(
    requestContext: GraphQLRequestContext<TContext>,
  ): GraphQLRequestListener;
}

export interface GraphQLRequestListener {
  prepareRequest?(request: GraphQLRequest): void;
  executionDidStart({
    operation,
  }: {
    operation: OperationDefinitionNode;
  }): void;
}
