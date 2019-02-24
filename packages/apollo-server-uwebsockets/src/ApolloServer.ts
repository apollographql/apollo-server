import {
  ApolloServerBase,
  GraphQLOptions,
  Config
} from 'apollo-server-core';
import { renderPlaygroundPage } from '@apollographql/graphql-playground-html';
import { TemplatedApp as UWebSocketsApp, HttpRequest, } from 'uWebSockets.js'

import { graphql, graphqlPlayground, healthCheck, } from './uWebSocketsApollo';


export interface ServerRegistration {
  app: UWebSocketsApp
  path?: string;
  healthCheckPath?: string
  disableHealthCheck?: boolean;
  onHealthCheck?: (req: HttpRequest) => Promise<any>;
}

export class ApolloServer extends ApolloServerBase {
  constructor(options: Config) {
    super(options);
  }

  // Extract Apollo Server options from the request.
  async createGraphQLServerOptions(
    /* res: HttpResponse,
     req: HttpRequest,*/
  ): Promise<GraphQLOptions> {
    // console.log('Creating server options', req, res)
    // Note: This is what get's passed to the `context` creator
    return super.graphQLServerOptions({ /*req, res*/ });
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

    // Handle incoming GraphQL requests via POST or GET using Apollo Server.
    const graphqlHandler = graphql(() => this.createGraphQLServerOptions())

    app.post(this.graphqlPath, graphqlHandler)
    app.get(this.graphqlPath, graphqlHandler)

    if (!disableHealthCheck) {
      // If health checking is enabled, trigger the `onHealthCheck`
      // function when the health check URL is requested.
      const healthCheckHandler = healthCheck(onHealthCheck)

      app.get('/.well-known/apollo/server-health', healthCheckHandler)
    }

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

      // TODO make this a wildcard or this.graphqlPath?
      app.get('/', graphqlPlaygroundHandler)
    }

    // Catch-all route to return 404 or 405s
    app.any('/*', (res, req) => {

      res.onAborted(() => {
        /* TODO */
      })

      const method = req.getMethod().toUpperCase()

      if (method !== 'POST' && method !== 'GET') {
        res.writeStatus('405')
        res.writeHeader('allow', 'GET, POST')
        res.end('Method Not Allowed')
      } else {
        res.writeStatus('404')
        res.end('Not Found')
      }
    })
  }
  // This integration supports file uploads.
  protected supportsUploads(): boolean {
    return true;
  }

  // This integration supports subscriptions.
  protected supportsSubscriptions(): boolean {
    return false;
  }
}
