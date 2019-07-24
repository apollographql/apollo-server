import { GraphQLRequestContext, GraphQLResponse } from 'apollo-server-types';
import {
  GraphQLSchema,
  graphql,
  graphqlSync,
  DocumentNode,
  parse,
} from 'graphql';
import { enableGraphQLExtensions } from 'graphql-extensions';
import { GraphQLDataSource } from './types';

export class LocalGraphQLDataSource implements GraphQLDataSource {
  constructor(public readonly schema: GraphQLSchema) {
    // FIXME: This is needed to enable support for `resolveObject`, but we
    // should move that to `apollo-graphql`
    enableGraphQLExtensions(schema);
  }

  async process<TContext>({
    request,
    context,
  }: Pick<GraphQLRequestContext<TContext>, 'request' | 'context'>): Promise<
    GraphQLResponse
  > {
    return graphql({
      schema: this.schema,
      source: request.query!,
      variableValues: request.variables,
      operationName: request.operationName,
      contextValue: context,
    });
  }

  public sdl(): DocumentNode {
    const result = graphqlSync({
      schema: this.schema,
      source: `{ _service { sdl }}`,
    });
    if (result.errors) {
      throw new Error(result.errors.map(error => error.message).join('\n\n'));
    }

    const sdl = result.data && result.data._service && result.data._service.sdl;
    return parse(sdl);
  }
}
