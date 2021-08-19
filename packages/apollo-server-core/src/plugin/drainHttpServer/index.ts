import type http from 'http';
import type { ApolloServerPlugin } from 'apollo-server-plugin-base';
import { Stopper } from './stoppable';

// FIXME docs in code
// FIXME write docs
export interface ApolloServerPluginDrainHttpServerOptions {
  httpServer: http.Server;
  // Defaults to 10_000
  stopGracePeriodMillis?: number;
}

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
