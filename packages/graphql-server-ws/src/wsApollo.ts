import { runQueryReactive, Observable, GraphQLOptions, resolveGraphqlOptions } from "graphql-server-core";
import { WSHandler, WSGraphQLOptionsFunction, WSMessageParams, WSGraphQLOptions, WSRequest } from './interfaces';
import { formatError } from 'graphql';
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

import { IObservable, ReactiveQueryOptions } from 'graphql-server-core';
import { ExecutionResult } from 'graphql';

class RequestsManager {
  protected requests = {};

	public runQuery(key: number, params: ReactiveQueryOptions): IObservable<ExecutionResult> {
		return new Observable((observer) => {
			// TODO: Implement toDiff
			// return runQueryReactive(params).toDiff().subscribe({
			return runQueryReactive(params).subscribe({
				next: (data) => observer.next(Object.assign(data, { id: key })),
				error: observer.error,
				complete: observer.complete,
			});
		});
  }

  public unsubscribe(key: number) {
    if ( this.requests.hasOwnProperty(key) ) {
      this.requests[key].unsubscribe();
      delete this.requests[key];
    }
  }

  public unsubscribeAll() {
    Object.keys(this.requests).forEach((k) => {
      this.unsubscribe(parseInt(k));
    });
  }
}

function handleRequest(ws: Websocket, rm: RequestsManager, {requestParams, graphqlOptions}: WSMessageParams) {
  const formatErrorFn = graphqlOptions.formatError || formatError;

  if (Array.isArray(requestParams)) {
    return Observable.of({ errors: ['Does not support batching'] });
  }
  rm.unsubscribe(requestParams.id);

  if ( requestParams.action === 'cancel' ) {
    return Observable.empty();
  }

  const query = requestParams.query;
  const operationName = requestParams.operationName;
  let variables = requestParams.variables;

  if (typeof variables === 'string') {
    try {
      variables = JSON.parse(variables);
    } catch (error) {
      return Observable.throw(Error('Variables are invalid JSON.'));
    }
  }

  let params = {
    schema: graphqlOptions.schema,
    query: query,
    variables: variables,
    context: graphqlOptions.context,
    rootValue: graphqlOptions.rootValue,
    operationName: operationName,
    logFunction: graphqlOptions.logFunction,
    validationRules: graphqlOptions.validationRules,
    formatError: formatErrorFn,
    formatResponse: graphqlOptions.formatResponse,
    debug: graphqlOptions.debug,
    executeReactive: graphqlOptions.engine.executeReactive,
  };

  if (graphqlOptions.formatParams) {
    params = graphqlOptions.formatParams(params);
  }

	return rm.runQuery(requestParams.id, params);
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
			const requests = new RequestsManager();
			const subscription = ObservableFromWs(ws, graphqlOptions).subscribe({
				next: (message) => {
				  handleRequest(ws, requests, message)
					.subscribe({
						next: (data) => ws.send(JSON.stringify(data)),
						error: (e) => ws.close(1008, e.message),
						complete: () => {},
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
