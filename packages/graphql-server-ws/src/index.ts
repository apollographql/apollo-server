import {
  IObservable,
  Observer,
  Observable,
  GraphQLOptions,
  resolveGraphqlOptions,
  ReactiveGraphQLOptions,
  ReactiveRequest,
  ReactiveMessage,
  RequestsManager,
} from 'graphql-server-reactive-core';
import * as Websocket from 'ws';

export interface WSMessageParams extends ReactiveMessage {
  flags: {
    binary: boolean;
  };
}

export interface WSGraphQLOptionsFunction {
  (ws: Websocket): ReactiveGraphQLOptions | Promise<ReactiveGraphQLOptions>;
}

export interface WSHandler {
  (ws: Websocket): void;
}

function ObservableFromWs(ws: Websocket, graphqlOptions: ReactiveGraphQLOptions): IObservable<WSMessageParams> {
  return new Observable<WSMessageParams>((observer) => {
    let nextListener = (data: any, flags: {binary: boolean}) => {
      let request: WSMessageParams;
      try {
        try {
          request = {
            requestParams: JSON.parse(data) as ReactiveRequest,
            graphqlOptions,
            flags: flags,
          };
        } catch (e) {
          throw new Error('Message must be JSON-parseable.');
        }
      } catch (e) {
        observer.error(e);
      }
      observer.next(request);
    };
    let errorListener = (e: Error) => {
      observer.error(e);
    };
    let completeListener = () => {
      observer.complete();
    };
    ws.on('message', nextListener);
    ws.on('error', errorListener);
    ws.on('close', completeListener);

    return () => {
      ws.removeListener('close', completeListener);
      ws.removeListener('error', errorListener);
      ws.removeListener('message', nextListener);

      ws.close();
    };
  });
}

export function graphqlWs(options: ReactiveGraphQLOptions | WSGraphQLOptionsFunction): WSHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    throw new Error(`Apollo Server expects exactly one argument, got ${arguments.length}`);
  }

  return (ws): void => {
    // XXX graphlWs should be called as event emitter callback,
    // they do not support promises.
    resolveGraphqlOptions(options, ws)
      .then((graphqlOptions: ReactiveGraphQLOptions) => {
        const requests = new RequestsManager();
        const subscription = ObservableFromWs(ws, graphqlOptions).subscribe({
          next: (message) => {
            requests.handleRequest(message, {
              next: (data) => ws.send(JSON.stringify(data)),
              error: (e) => ws.close(1008, e.message),
              complete: () => {/* noop */},
            });
          },
          error: (e) => {
            // RFC 6455 - 7.4.1 ==> 1008 indicates that an endpoint is terminating the connection
            // because it has received a message that violates its policy.
            return ws.close(1008, e.message);
          },
          complete: () => {
            requests.unsubscribeAll();
            ws.terminate();
          },
        });
      })
      .catch((e) => {
        // RFC 6455 - 7.4.1 ==> 1002 indicates that an endpoint is terminating the connection due
        // to a protocol error.
        ws.close(1002, e.message);
      });
  };
}
