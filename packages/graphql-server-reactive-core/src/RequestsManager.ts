import { IObservable, Observer, Observable, Subscription } from './Observable';
import { ReactiveQueryOptions, runQueryReactive } from './runQueryReactive';
import { ReactiveGraphQLOptions, RGQLExecuteFunction } from './reactiveOptions';
import { formatError, ExecutionResult } from 'graphql';
import {
  RGQL_MSG_ERROR,
  RGQL_MSG_COMPLETE,
  RGQL_MSG_DATA,
  RGQL_MSG_START,
  RGQL_MSG_STOP,
  RGQL_MSG_KEEPALIVE,
  RGQLPacket,
  RGQLPacketData,
  RGQLPayloadStart,
} from './messageTypes';

export class RequestsManager {
  protected requests: { [key: number]: Subscription } = {};
  protected orphanedResponds: Subscription[] = [];
  protected respondsObservable: IObservable<RGQLPacket>;
  protected executeReactive: RGQLExecuteFunction;

  constructor(protected graphqlOptions: ReactiveGraphQLOptions,
              protected requestsObservable: IObservable<RGQLPacket>) {
      this.respondsObservable = new Observable((observer) => {
        const kaSub = this._keepAliveObservable().subscribe({
          next: (packet) => observer.next(packet),
          error: observer.error,
          complete: () => { /* noop */ },
        });
        const sub = requestsObservable.subscribe({
          next: (request) => this._handleRequest(request, observer),
          error: observer.error,
          complete: observer.complete,
        });

        return () => {
          if ( kaSub ) {
            kaSub.unsubscribe();
          }
          if ( sub ) {
            sub.unsubscribe();
          }

          this._unsubscribeAll();
        };
      });

      this.executeReactive = graphqlOptions.executor.executeReactive.bind(graphqlOptions.executor);
  }

  public get responds(): IObservable<RGQLPacket> {
    // XXX: Need to wrap with multicast.
    return this.respondsObservable;
  }

  protected _handleRequest(request: RGQLPacket, onMessageObserver: Observer<RGQLPacket>) {
    this._subscribeResponds(this._executeRequest(request.data), request, onMessageObserver);
  }

  protected _keepAliveObservable(): Observable<RGQLPacket> {
    const keepAlive: number = this.graphqlOptions.keepAlive;

    return new Observable((observer) => {
      if ( ! keepAlive ) {
        observer.complete();
        return () => {};
      }

      const kaInterval = setInterval(() => {
        observer.next({ data: { type: RGQL_MSG_KEEPALIVE } });
      }, keepAlive)
      return () => {
        clearInterval(kaInterval);
      };
    });
  }

  protected _executeRequest(request: RGQLPacketData): IObservable<ExecutionResult> {
    const formatErrorFn = this.graphqlOptions.formatError || formatError;

    try {
      this._validateRequest(request);
    } catch (e) {
      return Observable.of({ errors: [formatErrorFn(e)] });
    }

    if (Array.isArray(request)) {
      return Observable.of({ errors: [formatErrorFn(new Error('Websocket does not support batching'))] });
    }
    this._unsubscribe(request.id);

    if ( request.type === RGQL_MSG_STOP ) {
      return Observable.empty();
    }
    const graphqlRequest: RGQLPayloadStart = request.payload;
    const query = graphqlRequest.query;
    const operationName = graphqlRequest.operationName;
    let variables = graphqlRequest.variables;

    if (typeof variables === 'string') {
      try {
        variables = JSON.parse(variables);
      } catch (error) {
        return Observable.of({ errors: [formatErrorFn(new Error('Variables are invalid JSON.'))] });
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

  protected _subscribeResponds(obs: IObservable<ExecutionResult>, request: RGQLPacket, onMessageObserver: Observer<RGQLPacket>): void {
    const key: number = request.data.id;
    const respondSubscription = this._prepareRespondPacket(obs, key, request.metadata).subscribe(onMessageObserver);

    if ( key ) {
      this.requests[key] = respondSubscription;
    } else {
      this.orphanedResponds.push(respondSubscription);
    }
  }

  protected _validateRequest(packet: RGQLPacketData) {
    if ( undefined === packet.id ) {
      throw new Error('Message missing id field');
    }

    if ( undefined === packet.type ) {
      throw new Error('Message missing type field');
    }

    switch ( packet.type ) {
      case RGQL_MSG_START:
        if ( undefined === packet.payload ) {
          throw new Error('Message missing payload field');
        }
        if ( undefined === (<RGQLPayloadStart> packet.payload).query ) {
          throw new Error('Message missing payload.query field');
        }
        return;
      case RGQL_MSG_STOP:
       // Nothing much to check, no payload.
       return;
      default:
        throw new Error('Invalid type used');
    }
  }

  protected _prepareRespondPacket(obs: IObservable<ExecutionResult>, key: number, metadata?: Object): IObservable<RGQLPacket> {
    return new Observable((observer) => {
      return this._flattenObservable(obs, key).subscribe({
        next: (data: RGQLPacketData) => {
          // data => packet (data + metadata)
          const nextData = {
            data,
            ...(metadata ? { metadata } : {}),
          };

          observer.next(nextData);
        },
        error: observer.error,
        complete: observer.complete,
      });
    });
  }

  protected _flattenObservable(obs: IObservable<ExecutionResult>, id?: number): IObservable<RGQLPacketData> {
    return new Observable((observer) => {
      return obs.subscribe({
        next: (data) => {
          observer.next({
            ...((undefined !== id) ? { id } : {}),
            type: RGQL_MSG_DATA,
            payload: data,
          });
        },
        error: (e) => {
          observer.next({
            ...((undefined !== id) ? { id } : {}),
            type: RGQL_MSG_ERROR,
            payload: e,
          });
        },
        complete: () => {
          observer.next({
            ...((undefined !== id) ? { id } : {}),
            type: RGQL_MSG_COMPLETE,
          });
        },
      });
    });
  }

  protected _unsubscribeAll() {
    Object.keys(this.requests).forEach((k) => {
      this._unsubscribe(parseInt(k, 10));
    });

    while ( this.orphanedResponds.length > 0 ) {
      this.orphanedResponds.pop().unsubscribe();
    }
  }

  protected _unsubscribe(key: number) {
    if ( this.requests.hasOwnProperty(key) ) {
      this.requests[key].unsubscribe();
      delete this.requests[key];
    }
  }
}
