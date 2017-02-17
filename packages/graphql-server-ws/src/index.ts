import {
  RGQLPacket,
  RGQLPacketData,
  RequestsManager,
} from 'graphql-server-reactive-protocol';
import {
  resolveGraphqlOptions,
  ReactiveGraphQLOptions,
} from 'graphql-server-reactive-core';
import {
  IObservable,
  Observer,
  Observable,
} from 'graphql-server-observable';

export { ReactiveGraphQLOptions };

import * as Websocket from 'ws';

export interface WSPacket extends RGQLPacket {
  metadata: {
    flags: {
      masked: boolean;
    };
  };
}

export interface WSGraphQLOptionsFunction {
  (ws: Websocket): ReactiveGraphQLOptions | Promise<ReactiveGraphQLOptions>;
}

export interface WSHandler {
  (ws: Websocket): void;
}

function ObservableFromWs(ws: Websocket): IObservable<WSPacket> {
  return new Observable<WSPacket>((observer) => {
    let nextListener = (data: any, flags: any) => {
      let request: WSPacket;
      try {
        try {
          request = {
            metadata: { flags },
            data: JSON.parse(data) as RGQLPacketData,
          };
        } catch (e) {
          throw new Error('Received unparsable json string');
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
    // XXX: if we want to block connection by specific protocol
    // or anything else, this is the place to do so.

    resolveGraphqlOptions(options, ws)
      .then((graphqlOptions: ReactiveGraphQLOptions) => {
        const rm = new RequestsManager(graphqlOptions, ObservableFromWs(ws));
        const subscription = rm.responseObservable.subscribe({
            next: (packet) => ws.send(JSON.stringify(packet.data)),
            error: (e) => ws.close(1008, e.message),
            complete: () => {
              subscription.unsubscribe();
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
