import * as accepts from 'accepts';
import { IncomingMessage } from 'http';
import { GraphQLOptions } from 'apollo-server-core';
import { MiddlewareRegistrationOptions } from './types';

export function launchGui<C = any, GUI = any>(
  config: MiddlewareRegistrationOptions<any, any, any>,
  req: IncomingMessage,
  gui: (options: GraphQLOptions | any) => any | GUI,
  ...args: any[]
): boolean {
  // make sure we check to see if graphql gui should be on
  if (config.gui !== false && req.method === 'GET') {
    //perform more expensive content-type check only if necessary
    const accept = accepts(req);
    const types = accept.types() as string[];
    const prefersHTML =
      types.find(
        (x: string) => x === 'text/html' || x === 'application/json',
      ) === 'text/html';

    if (prefersHTML) {
      gui({
        endpoint: config.path,
        subscriptionsEndpoint: config.subscriptions && config.path,
      })(...args);
      return true;
    }
  }
  return false;
}
