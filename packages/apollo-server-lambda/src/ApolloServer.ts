import * as lambda from 'aws-lambda';
import { ApolloServerBase } from 'apollo-server-core';
export { GraphQLOptions, GraphQLExtension } from 'apollo-server-core';
import { GraphQLOptions } from 'apollo-server-core';
import {
  MiddlewareOptions as PlaygroundMiddlewareOptions,
  renderPlaygroundPage,
  RenderPageOptions as PlaygroundRenderPageOptions,
} from 'graphql-playground-html';

import { graphqlLambda } from './lambdaApollo';

export interface ServerRegistration {
  event: lambda.APIGatewayProxyEvent;
  context: lambda.Context;
  callback: lambda.APIGatewayProxyCallback;
  gui?: boolean | PlaygroundMiddlewareOptions;
}

export class ApolloServer extends ApolloServerBase {
  //This translates the arguments from the middleware into graphQL options It
  //provides typings for the integration specific behavior, ideally this would
  //be propagated with a generic to the super class
  async createGraphQLServerOptions(
    event: lambda.APIGatewayProxyEvent,
    context: lambda.Context,
  ): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ event, context });
  }

  public async handle({ event, context, callback, gui }: ServerRegistration) {
    const guiEnabled =
      !!gui || (gui === undefined && process.env.NODE_ENV !== 'production');

    if (guiEnabled && event.httpMethod === 'GET') {
      const playgroundRenderPageOptions: PlaygroundRenderPageOptions = {
        endpoint: '/',
        version: '1.7.0',
        ...(typeof gui === 'boolean' ? {} : gui),
      };

      return callback(null, {
        body: renderPlaygroundPage(playgroundRenderPageOptions),
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    graphqlLambda(this.createGraphQLServerOptions.bind(this))(
      event,
      context,
      callback,
    );
  }
}
