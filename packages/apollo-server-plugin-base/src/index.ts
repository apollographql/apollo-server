import { GraphQLRequest } from 'apollo-server-core/src/requestPipelineAPI';

export abstract class ApolloServerPlugin {
  serverWillStart?(): void;
  requestDidStart?(): GraphQLRequestListener;
}

export interface GraphQLRequestListener {
  prepareRequest?(request: GraphQLRequest): void;
}
