import { GraphQLResponse, GraphQLRequestContext } from 'apollo-server-types';

export interface GraphQLDataSource<TContext = any> {
  process(
    request: Pick<GraphQLRequestContext<TContext>, 'request' | 'context'>,
  ): Promise<GraphQLResponse>;
}
