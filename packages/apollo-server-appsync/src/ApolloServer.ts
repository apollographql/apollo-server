import {
  APIGatewayProxyCallback,
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { ApolloServerBase } from 'apollo-server-core';
import { GraphQLOptions, Config } from 'apollo-server-core';

import { graphqlLambda } from './lambdaApollo';

export class ApolloServer extends ApolloServerBase {
  // If you feel tempted to add an option to this constructor. Please consider
  // another place, since the documentation becomes much more complicated when
  // the constructor is not longer shared between all integration
  constructor(options: Config) {
    if (process.env.ENGINE_API_KEY || options.engine) {
      options.engine = {
        sendReportsImmediately: true,
        ...(typeof options.engine !== 'boolean' ? options.engine : {}),
      };
    }
    super(options);
  }

  // This translates the arguments from the middleware into graphQL options It
  // provides typings for the integration specific behavior, ideally this would
  // be propagated with a generic to the super class
  createGraphQLServerOptions(
    event: APIGatewayProxyEvent,
    context: LambdaContext,
  ): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ event, context });
  }

  public createHandler() {
    return (
      event: APIGatewayProxyEvent,
      context: LambdaContext,
      callback: APIGatewayProxyCallback,
    ) => {
      const callbackFilter: APIGatewayProxyCallback = (error, result) => {
        callback(
          error,
          result && {
            ...result,
            headers: {
              ...result.headers,
            },
          },
        );
      };

      graphqlLambda(async () => {
        // In a world where this `createHandler` was async, we might avoid this
        // but since we don't want to introduce a breaking change to this API
        // (by switching it to `async`), we'll leverage the
        // `GraphQLServerOptions`, which are dynamically built on each request,
        // to `await` the `promiseWillStart` which we kicked off at the top of
        // this method to ensure that it runs to completion (which is part of
        // its contract) prior to processing the request.
        await promiseWillStart;
        return this.createGraphQLServerOptions(event, context);
      })(event, context, callbackFilter);
    };
  }
}
