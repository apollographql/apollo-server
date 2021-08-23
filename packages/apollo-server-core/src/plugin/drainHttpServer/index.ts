import type http from 'http';
import type { ApolloServerPlugin } from 'apollo-server-plugin-base';
import { Stopper } from './stoppable';

/**
 * Options for ApolloServerPluginDrainHttpServer.
 */
export interface ApolloServerPluginDrainHttpServerOptions {
  /**
   * The http.Server (or https.Server, etc) to drain. Required.
   */
  httpServer: http.Server;
  /**
   * How long to wait before forcefully closing non-idle connections.
   * Defaults to 10_000 (ten seconds).
   */
  stopGracePeriodMillis?: number;
}

/**
 * This plugin is used with apollo-server-express and other framework
 * integrations to drain your HTTP server on shutdown.
 * See https://www.apollographql.com/docs/apollo-server/api/plugin/drain-http-server/
 * for details.
 */
export function ApolloServerPluginDrainHttpServer(
  options: ApolloServerPluginDrainHttpServerOptions,
): ApolloServerPlugin {
  const stopper = new Stopper(options.httpServer);
  return {
    async serverWillStart() {
      return {
        async drainServer() {
          await stopper.stop(options.stopGracePeriodMillis ?? 10_000);
        },
      };
    },
  };
}
