import { GraphQLExtension, GraphQLResponse } from 'graphql-extensions';
import { formatApolloErrors } from 'apollo-server-errors';

export class FormatErrorExtension extends GraphQLExtension {
  private formatError: Function;
  private debug: boolean;

  public constructor(formatError: Function, debug: boolean = false) {
    super();
    this.formatError = formatError;
    this.debug = debug;
  }

  public willSendResponse(o: {
    graphqlResponse: GraphQLResponse;
  }): void | { graphqlResponse: GraphQLResponse } {
    if (o.graphqlResponse.errors) {
      return {
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
