import { IObservable, Observer, Observable, Subscription } from './Observable';
import { ReactiveQueryOptions, runQueryReactive } from './runQueryReactive';
import { ReactiveGraphQLOptions } from './reactiveOptions';
import { formatError, ExecutionResult } from 'graphql';
import {
  RGQL_MSG_ERROR,
  RGQL_MSG_COMPLETE,
  RGQL_MSG_DATA,
  RGQL_MSG_START,
  RGQL_MSG_STOP,
  RGQLMessageType,
  RGQLPayloadType,
  RGQLPayloadStart,
} from './messageTypes';

export interface RGQLPacket {
  id: number; // Per socket increasing number
  type: RGQLMessageType;
  payload: RGQLPayloadType,
}

export interface ReactiveRequest {
  packet: RGQLPacket;
  graphqlOptions?: ReactiveGraphQLOptions;
}

export class RequestsManager {
  protected requests = {};

  public handleRequest(message: ReactiveRequest, onMessageObserver: Observer<RGQLPacket>) {
    this._subscribeRequest(this._prepareRequest(message), message.packet.id, onMessageObserver);
  }

  public unsubscribeAll() {
    Object.keys(this.requests).forEach((k) => {
      this._unsubscribe(parseInt(k, 10));
    });
  }

  protected _prepareRespond(obs: IObservable<ExecutionResult>, key: number): IObservable<RGQLPacket> {
    return new Observable((observer) => {
      return this._convertRespond(obs).subscribe({
        next: (data) => {
          if ( undefined !== key ) {
            observer.next(Object.assign(data, { id: key }));
          } else {
            observer.next(data);
          }
        },
        error: observer.error,
        complete: observer.complete,
      });
    });
  }

  protected _convertRespond(obs: IObservable<ExecutionResult>): IObservable<RGQLPacket> {
    return new Observable((observer) => {
      return obs.subscribe({
        next: (data) => {
          observer.next({
            type: RGQL_MSG_DATA,
            payload: data,
          });
        },
        error: (e) => {
          observer.next({
            type: RGQL_MSG_ERROR,
            payload: e,
          });
          observer.complete();
        },
        complete: () => {
          observer.next({
            type: RGQL_MSG_COMPLETE,
          });
          observer.complete();
        },
      });
    });
  }

  protected _subscribeRequest(obs: IObservable<ExecutionResult>, key: number, onMessageObserver: Observer<RGQLPacket>): void {
    const respondObs = this._prepareRespond(obs, key);
    if ( key ) {
      this.requests[key] = respondObs.subscribe(onMessageObserver);
    } else {
      respondObs.subscribe(onMessageObserver);
    }
  }

  protected _unsubscribe(key: number) {
    if ( this.requests.hasOwnProperty(key) ) {
      this.requests[key].unsubscribe();
      delete this.requests[key];
    }
  }

  protected _prepareRequest({packet, graphqlOptions}: ReactiveRequest): IObservable<ExecutionResult> {
    const formatErrorFn = graphqlOptions.formatError || formatError;

    try {
      this._validateRequest(packet);
    } catch (e) {
      return Observable.of({ errors: [formatErrorFn(e)] });
    }

    if (Array.isArray(packet)) {
      return Observable.of({ errors: [formatErrorFn(new Error('Websocket does not support batching'))] });
    }
    this._unsubscribe(packet.id);

    if ( packet.type === RGQL_MSG_STOP ) {
      return Observable.empty();
    }
    const graphqlRequest: RGQLPayloadStart = packet.payload;
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
      executeReactive: graphqlOptions.executor.executeReactive.bind(graphqlOptions.executor),
    };

    if (graphqlOptions.formatParams) {
      params = graphqlOptions.formatParams(params);
    }

    return runQueryReactive(params);
  }

  protected _validateRequest(packet: RGQLPacket) {
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
}
