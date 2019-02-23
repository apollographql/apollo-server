import {
  ApolloServerBase,
  GraphQLOptions,
  processFileUploads,
} from 'apollo-server-core';
import { renderPlaygroundPage } from '@apollographql/graphql-playground-html';
import { TemplatedApp as UWebSocketsApp, HttpRequest, HttpResponse } from 'uWebSockets.js'

import { RequestHandler } from './types'
import { graphql, graphqlPlayground, healthCheck, } from './uWebSocketsApollo';


export interface ServerRegistration {
  app: UWebSocketsApp
  path?: string;
  healthCheckPath?: string
  disableHealthCheck?: boolean;
  onHealthCheck?: (req: HttpRequest) => Promise<any>;
}

export class ApolloServer extends ApolloServerBase {
  // Extract Apollo Server options from the request.
  async createGraphQLServerOptions(
    res: HttpResponse,
    req: HttpRequest,
  ): Promise<GraphQLOptions> {
    // Note: This is what get's passed to the `context` creator
    return super.graphQLServerOptions({ req, res });
  }

  public async attachHandlers({
    app,
    path,
    disableHealthCheck,
    onHealthCheck,
  }: ServerRegistration) {
    this.graphqlPath = path || '/graphql'

    // TODO Adhere to correct Apollo logic for this
    //const promiseWillStart = this.willStart()
    await this.willStart()

    // Handle incoming GraphQL requests using Apollo Server.
    const graphqlHandler = graphql(this.createGraphQLServerOptions)
    app.post(this.graphqlPath, graphqlHandler)

    if (this.playgroundOptions) {
      // If the `playgroundOptions` are set, register a `graphql-playground` instance
      // (not available in production) that is then used to handle all
      // incoming GraphQL requests.
      const middlewareOptions = {
        endpoint: this.graphqlPath,
        subscriptionEndpoint: this.subscriptionsPath,
        ...this.playgroundOptions,
      };

      const graphqlPlaygroundHandler = graphqlPlayground(middlewareOptions, renderPlaygroundPage)

      app.get('/*', graphqlPlaygroundHandler)
    }

    if (!disableHealthCheck) {
      // If health checking is enabled, trigger the `onHealthCheck`
      // function when the health check URL is requested.
      const healthCheckHandler = healthCheck(onHealthCheck)

      app.get('/.well-known/apollo/server-health', healthCheckHandler)
    }

    // Catch-all route to return 404's
    app.any('/*', (res) => {
      res.writeStatus('404')
      res.close()
    })
  }
  // This integration supports file uploads.
  protected supportsUploads(): boolean {
    return false;
  }

  // This integration supports subscriptions.
  protected supportsSubscriptions(): boolean {
    return false;
  }
}
