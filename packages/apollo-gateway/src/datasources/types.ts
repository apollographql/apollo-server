import { GraphQLResponse, GraphQLRequestContext } from 'apollo-server-types';
import { Headers } from 'apollo-server-env';

export interface GraphQLDataSource {
  process<TContext>(
    request: Pick<GraphQLRequestContext<TContext>, 'request' | 'context'>,
    headers?: Headers
  ): Promise<GraphQLResponse>;
}
