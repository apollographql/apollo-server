import { GraphQLExtension, GraphQLResponse } from 'graphql-extensions';
import { formatApolloErrors } from 'apollo-server-errors';

export class FormatErrorExtension<TContext = any> extends GraphQLExtension {
  private formatError?: Function;
  private debug: boolean;

  public constructor(formatError?: Function, debug: boolean = false) {
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
