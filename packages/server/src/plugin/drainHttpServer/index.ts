import type http from 'http';
import { AbortController } from 'node-abort-controller';
import type { ApolloServerPlugin } from '../../externalTypes/index.js';
import { Stopper } from './stoppable.js';

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
          // Note: we don't use `AbortSignal.timeout()` here because our
          // polyfill doesn't support it (and even once we drop Node v14
          // support, if we don't require at least Node v16.14 then the built-in
          // version won't support it either).
          const hardDestroyAbortController = new AbortController();
          const stopGracePeriodMillis = options.stopGracePeriodMillis ?? 10_000;
          let timeout: NodeJS.Timeout | undefined;
          if (stopGracePeriodMillis < Infinity) {
            timeout = setTimeout(
              () => hardDestroyAbortController.abort(),
              stopGracePeriodMillis,
            );
          }
          await stopper.stop(hardDestroyAbortController.signal);
          if (timeout) {
            clearTimeout(timeout);
          }
        },
      };
    },
  };
}
