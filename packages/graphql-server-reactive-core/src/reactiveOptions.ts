import { GraphQLOptions } from 'graphql-server-core';
import { ReactiveExecuteFunction } from './runQueryReactive';

export interface ReactiveGraphQLEngine {
  executeReactive: ReactiveExecuteFunction;
}

export interface ReactiveGraphQLOptions extends GraphQLOptions {
  engine: ReactiveGraphQLEngine;
}
