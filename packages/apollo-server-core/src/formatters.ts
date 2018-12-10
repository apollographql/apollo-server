import { GraphQLExtension, GraphQLResponse } from 'graphql-extensions';
import { formatApolloErrors } from 'apollo-server-errors';

function isPromise(x: any): x is Promise<any> {
  return x && typeof x.then === 'function';
}

export class FormatErrorExtension<TContext = any> extends GraphQLExtension {
  private formatError?: Function;
  private debug: boolean;

  public constructor(formatError?: Function, debug: boolean = false) {
    super();
    this.formatError = formatError;
    this.debug = debug;
  }

  public willSendResponse(
    o:
      | Promise<{
          graphqlResponse: GraphQLResponse;
          context: TContext;
        }>
      | {
          graphqlResponse: GraphQLResponse;
          context: TContext;
        },
  ):
    | Promise<{ graphqlResponse: GraphQLResponse; context: TContext } | void>
    | { graphqlResponse: GraphQLResponse; context: TContext }
    | void {
    if (isPromise(o)) {
      return this.asyncWillSendResponse(o);
    } else if (o.graphqlResponse.errors) {
      let formattedErrors = formatApolloErrors(o.graphqlResponse.errors, {
        formatter: this.formatError,
        debug: this.debug,
      });
      if (isPromise(formattedErrors)) {
        return this.asyncWillSendResponse(o);
      } else if (o) {
        return {
          ...o,
          graphqlResponse: {
            ...o.graphqlResponse,
            errors: formattedErrors,
          },
        };
      }
    }
    return o;
  }

  public async asyncWillSendResponse(
    o:
      | Promise<{
          graphqlResponse: GraphQLResponse;
          context: TContext;
        }>
      | { graphqlResponse: GraphQLResponse; context: TContext },
  ): Promise<{ graphqlResponse: GraphQLResponse; context: TContext } | void> {
    let p = await o;
    if (p.graphqlResponse.errors) {
      return {
        ...p,
        graphqlResponse: {
          ...p.graphqlResponse,
          errors: await formatApolloErrors(p.graphqlResponse.errors, {
            formatter: this.formatError,
            debug: this.debug,
          }),
        },
      };
    }
    return o;
  }
}
