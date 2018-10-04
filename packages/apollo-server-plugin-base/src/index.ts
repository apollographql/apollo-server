import { GraphQLSchema } from 'graphql';
import { KeyValueCache } from 'apollo-server-caching';

export abstract class ApolloServerPluginBase {
  [key: string]: any;
  constructor(public options?: any) {}
  serverWillStart?(parent: any): void;
}

interface ApolloServerRequestListenerInterface {
  start?(): void;
}

export abstract class ApolloServerRequestListenerBase
  implements ApolloServerRequestListenerInterface {
  constructor() {}
  start?(): void;
}

interface PluginEventBase {
  name: string;
  args?: any;
}

export interface PluginEventServerWillStart extends PluginEventBase {
  args: {
    schema: GraphQLSchema;
    persistedQueries?: {
      cache: KeyValueCache;
    };
    engine?: any;
  };
}

export type PluginEvent = PluginEventServerWillStart;
