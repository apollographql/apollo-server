export {
  processGraphQLRequest,
  GraphQLRequestContext,
  GraphQLRequestPipelineConfig,
} from "apollo-server-core/dist/requestPipeline";
import {
  GraphQLRequest as GraphQLRequestWithHttp,
  GraphQLResponse as GraphQLResponseWithHttp,
} from 'apollo-server-types';

export type GraphQLRequest = Omit<GraphQLRequestWithHttp, 'http'>;
export type GraphQLResponse = Omit<GraphQLResponseWithHttp, 'http'>;

// TODO(AS3) I'm not sure if this is execution.  Perhaps, a top-level export.
export { GraphQLSchemaModule } from 'apollo-graphql';

export { Context, ContextFunction } from 'apollo-server-core';
