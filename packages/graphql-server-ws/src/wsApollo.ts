import { GraphQLOptions, resolveGraphqlOptions } from "graphql-server-core";
import { WSHandler, WSGraphQLOptionsFunction, WSMessageParams, WSGraphQLOptions, WSRequest } from './interfaces';
import { Observable } from 'graphql-server-core';
import * as Websocket from 'ws';

function validateRequest(request: WSRequest) {
  if ( undefined === request.id ) {
    throw new Error('Message missing id field');
  }

  if ( undefined === request.action ) {
    throw new Error('Message missing action field');
  }

  switch ( request.action ) {
		case 'request':
			if ( undefined === request.query ) {
				throw new Error('Message missing query field');
			}
			// fallthrou
		case 'cancel':
			// Allgood :)
			return;
		default:
			throw new Error('Invalid action used');
  }
}

function ObservableFromWs(ws: Websocket, graphqlOptions: WSGraphQLOptions): Observable<WSMessageParams> {
	return new Observable<WSMessageParams>((observer) => {
		let nextListener = (data: any, flags: {binary: boolean}) => {
			let request: WSMessageParams;
			try {
				try {
					request = {
						requestParams: JSON.parse(data),
						graphqlOptions,
						flags: flags
					};
				} catch (e) {
					throw new Error('Message must be JSON-parseable.');
				}

				validateRequest(request.requestParams);
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

export function graphqlWs(options: WSGraphQLOptions | WSGraphQLOptionsFunction): WSHandler {
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
    .then((graphqlOptions: WSGraphQLOptions) => {
			const requests = Object.create(null);
			const subscription = ObservableFromWs(ws, graphqlOptions).subscribe({
				next: (request) => {
					console.log(request);
				},
				error: (e) => {
					// RFC 6455 - 7.4.1 ==> 1008 indicates that an endpoint is terminating the connection
					// because it has received a message that violates its policy.
					return ws.close(1008, e.message);
				},
				complete: () => {
					Object.keys(requests).forEach((k) => {
						requests[k].unsubscribe();
						delete requests[k];
					});
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
