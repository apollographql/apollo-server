import { GraphQLResponse, GraphQLRequestContext } from 'apollo-server-types';

export interface GraphQLDataSource {
  process<TContext>(
    request: Pick<GraphQLRequestContext<TContext>, 'request' | 'context'>,
  ): Promise<GraphQLResponse>;
}
