import { GraphQLExtension, GraphQLResponse } from 'graphql-extensions';
import { formatApolloErrors, ApolloError } from 'apollo-server-errors';

export class FormatErrorExtension<TContext = any> extends GraphQLExtension {
  private formatError?: (error: ApolloError) => ApolloError;
  private debug: boolean;

  public constructor(
    formatError?: (error: ApolloError) => ApolloError,
    debug: boolean = false,
  ) {
    super();
    this.formatError = formatError;
    this.debug = debug;
  }

  public willSendResponse(o: {
    graphqlResponse: GraphQLResponse;
    context: TContext;
  }): void | { graphqlResponse: GraphQLResponse; context: TContext } {
    if (o.graphqlResponse.errors) {
      return {
        ...o,
        graphqlResponse: {
          ...o.graphqlResponse,
          errors: formatApolloErrors(o.graphqlResponse.errors, {
            formatter: this.formatError,
            debug: this.debug,
          }),
        },
      };
    }
  }
}
