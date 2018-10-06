// This file is compiled as a separate TypeScript project to avoid
// circular dependency issues from the `apollo-server-plugin-base` package
// depending on the types in it.

import { Request } from 'apollo-server-env';

export interface GraphQLRequest {
  query?: string;
  operationName?: string;
  variables?: { [name: string]: any };
  extensions?: Record<string, any>;
  httpRequest: Pick<Request, 'url' | 'method' | 'headers'>;
}
