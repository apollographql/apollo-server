import { GraphQLResponse, GraphQLRequestContext } from 'apollo-server-types';

export interface GraphQLDataSource<TContext extends Record<string, any> = Record<string, any>> {
  process(
    request: Pick<GraphQLRequestContext<TContext>, 'request' | 'context'>,
  ): Promise<GraphQLResponse>;
}
