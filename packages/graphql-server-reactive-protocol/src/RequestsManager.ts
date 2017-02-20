import {
  ReactiveGraphQLOptions,
  RGQLExecuteFunction ,
  runQueryReactive,
} from 'graphql-server-reactive-core';

import {
  IObservable,
  Observer,
  Observable,
  Subscription,
} from 'graphql-server-observable';

import { formatError, ExecutionResult } from 'graphql';

import {
  RGQL_MSG_ERROR,
  RGQL_MSG_COMPLETE,
  RGQL_MSG_DATA,
  RGQL_MSG_START,
  RGQL_MSG_STOP,
  RGQL_MSG_INIT,
  RGQL_MSG_INIT_SUCCESS,
  RGQL_MSG_KEEPALIVE,
  RGQLPacket,
  RGQLPacketData,
  RGQLPayloadStart,
} from './messageTypes';

export class RequestsManager {
  protected requests: { [key: number]: Subscription } = {};
  protected orphanedResponses: Subscription[] = [];
  protected _responseObservable: IObservable<RGQLPacket>;
  protected executeReactive: RGQLExecuteFunction;

  constructor(protected graphqlOptions: ReactiveGraphQLOptions,
              requestObservable: IObservable<RGQLPacket>) {
      this._responseObservable = new Observable((observer) => {
        const kaSub = this._keepAliveObservable().subscribe({
          next: (packet) => observer.next(packet),
          error: observer.error,
          complete: () => { /* noop */ },
        });
        const sub = requestObservable.subscribe({
          next: (request) => this._handleRequest(request, observer),
          error: observer.error,
          complete: observer.complete,
        });

        return () => {
          /* istanbul ignore else */
          if ( kaSub ) {
            kaSub.unsubscribe();
          }
          /* istanbul ignore else */
          if ( sub ) {
            sub.unsubscribe();
          }

          this._unsubscribeAll();
        };
      });

      this.executeReactive = graphqlOptions.executor.executeReactive.bind(graphqlOptions.executor);
  }

  public get responseObservable(): IObservable<RGQLPacket> {
    // XXX: Need to wrap with multicast.
    return this._responseObservable;
  }

  protected _handleRequest(request: RGQLPacket, onMessageObserver: Observer<RGQLPacket>) {
    this._subscribeResponse(this._executeRequest(request.data), request, onMessageObserver);
  }

  protected _keepAliveObservable(): Observable<RGQLPacket> {
    const keepAlive: number = this.graphqlOptions.keepAlive;

    if ( ! keepAlive ) {
      return Observable.empty();
    }

    return new Observable((observer) => {
      const kaInterval = setInterval(() => {
        observer.next({ data: { type: RGQL_MSG_KEEPALIVE } });
      }, keepAlive);

      return () => {
        clearInterval(kaInterval);
      };
    });
  }

  protected _executeRequest(request: RGQLPacketData): IObservable<RGQLPacketData> {
    try {
      this._validateRequest(request);
    } catch (e) {
      return Observable.throw(e);
    }

    const key: number = request.id;
    switch ( request.type ) {
      case RGQL_MSG_STOP:
        this._unsubscribe(key);
        return Observable.empty();
      case RGQL_MSG_INIT:
        // TODO: Add callback support.
        return Observable.of({ type: RGQL_MSG_INIT_SUCCESS });
      case RGQL_MSG_START:
        return this._flattenObservableData(this._executeStart(request),
                                           request.id);
      /* istanbul ignore next: invalid case. */
      default:
        return Observable.throw(new Error('FATAL ERROR: type was overritten since validation'));
    }
  }

  protected _executeStart(request: RGQLPacketData): IObservable<ExecutionResult> {
    const formatErrorFn = this.graphqlOptions.formatError || formatError;
    const graphqlRequest: RGQLPayloadStart = request.payload;
    const query = graphqlRequest.query;
    const operationName = graphqlRequest.operationName;
    let variables = graphqlRequest.variables;

    this._unsubscribe(request.id);
    if (typeof variables === 'string') {
      try {
        variables = JSON.parse(variables);
      } catch (error) {
        return Observable.throw(new Error('Variables are invalid JSON.'));
      }
    }

    let params = {
      schema: this.graphqlOptions.schema,
      query: query,
      variables: variables,
      context: this.graphqlOptions.context,
      rootValue: this.graphqlOptions.rootValue,
      operationName: operationName,
      logFunction: this.graphqlOptions.logFunction,
      validationRules: this.graphqlOptions.validationRules,
      formatError: formatErrorFn,
      formatResponse: this.graphqlOptions.formatResponse,
      debug: this.graphqlOptions.debug,
      executeReactive: this.executeReactive,
    };

    if (this.graphqlOptions.formatParams) {
      params = this.graphqlOptions.formatParams(params);
    }

    return runQueryReactive(params);
  }

  protected _subscribeResponse(obs: IObservable<RGQLPacketData>, request: RGQLPacket, onMessageObserver: Observer<RGQLPacket>): void {
    const key: number = request.data.id;
    const responseSubscription = this._prepareResponseStream(obs, key, request.metadata).subscribe(onMessageObserver);

    if ( key ) {
      this.requests[key] = responseSubscription;
    } else {
      this.orphanedResponses.push(responseSubscription);
    }
  }

  protected _validateRequest(packet: RGQLPacketData) {
    if ( undefined === packet.type ) {
      throw new Error('Request is missing type field');
    }

    switch ( packet.type ) {
      case RGQL_MSG_START:
        if ( undefined === packet.id ) {
          throw new Error('Request is missing id field');
        }

        if ( undefined === packet.payload ) {
          throw new Error('Request is missing payload field');
        }
        if (Array.isArray(packet.payload)) {
          throw new Error('interface does does not support batching');
        }
        if ( undefined === (<RGQLPayloadStart> packet.payload).query ) {
          throw new Error('Request is missing payload.query field');
        }
        return;
      case RGQL_MSG_STOP:
        if ( undefined === packet.id ) {
          throw new Error('Request is missing id field');
        }

        // Nothing much to check, no payload.
        return;
      case RGQL_MSG_INIT:
        // payload is optional.
        return;
      default:
        throw new Error('Request has invalid type');
    }
  }

  protected _prepareResponseStream(obs: IObservable<ExecutionResult>, key: number, metadata?: Object): IObservable<RGQLPacket> {
    return new Observable((observer) => {
      return this._flattenObservableErrors(obs, key).subscribe({
        next: (data: RGQLPacketData) => {
          // data => packet (data + metadata)
          const nextData = {
            data,
            ...(metadata ? { metadata } : {}),
          };

          observer.next(nextData);
        },
        error: observer.error,
        complete: () => { /* noop */ },
      });
    });
  }

  protected _flattenObservableData(obs: IObservable<ExecutionResult>, id?: number): IObservable<RGQLPacketData> {
    return new Observable((observer) => {
      return obs.subscribe({
        next: (data) => {
          observer.next({
            id,
            type: RGQL_MSG_DATA,
            payload: data,
          });
        },
        error: observer.error,
        complete: () => {
          observer.next({
            id,
            type: RGQL_MSG_COMPLETE,
          });
        },
      });
    });
  }

  protected _flattenObservableErrors(obs: IObservable<RGQLPacketData>, id?: number): IObservable<RGQLPacketData> {
    return new Observable((observer) => {
      return obs.subscribe({
        next: observer.next,
        error: (e) => {
          observer.next({
            ...((undefined !== id) ? { id } : {}),
            type: RGQL_MSG_ERROR,
            payload: e,
          });
        },
        complete: observer.complete,
      });
    });
  }

  protected _unsubscribeAll() {
    Object.keys(this.requests).forEach((k) => {
      this._unsubscribe(parseInt(k, 10));
    });

    while ( this.orphanedResponses.length > 0 ) {
      this.orphanedResponses.pop().unsubscribe();
    }
  }

  protected _unsubscribe(key: number) {
    if ( this.requests.hasOwnProperty(key) ) {
      this.requests[key].unsubscribe();
      delete this.requests[key];
    }
  }
}
