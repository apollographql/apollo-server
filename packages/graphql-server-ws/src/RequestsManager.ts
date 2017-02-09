import { IObservable, Observer, Observable, ReactiveQueryOptions, runQueryReactive, Subscription } from 'graphql-server-core';
import { WSMessageParams, WSRequest } from './interfaces';
import { toDiffObserver, IObservableDiff } from 'observable-diff-operator';
import { formatError, ExecutionResult } from 'graphql';

export class RequestsManager {
  protected requests = {};

  public handleRequest(message: WSMessageParams, onMessageObserver: Observer<IObservableDiff>) {
    this._subscribeRequest(this._prepareRequest(message), message.requestParams.id, onMessageObserver);
  }

  public unsubscribeAll() {
    Object.keys(this.requests).forEach((k) => {
      this._unsubscribe(parseInt(k, 10));
    });
  }

  protected _subscribeRequest(obs: IObservable<ExecutionResult>, key: number, onMessageObserver: Observer<IObservableDiff>): void {
    const diffObs = new Observable((observer) => {
      return obs.subscribe(toDiffObserver({
        next: (data) => {
          if ( undefined !== key ) {
            observer.next(Object.assign(data, { id: key }));
          } else {
            observer.next(data);
          }
        },
        error: observer.error,
        complete: observer.complete,
      }));
    });

    if ( key ) {
      this.requests[key] = diffObs.subscribe(onMessageObserver);
    } else {
      diffObs.subscribe(onMessageObserver);
    }
  }

  protected _unsubscribe(key: number) {
    if ( this.requests.hasOwnProperty(key) ) {
      this.requests[key].unsubscribe();
      delete this.requests[key];
    }
  }

  protected _prepareRequest({requestParams, graphqlOptions}: WSMessageParams): IObservable<ExecutionResult> {
    const formatErrorFn = graphqlOptions.formatError || formatError;

    try {
      this._validateRequest(requestParams);
    } catch (e) {
      return Observable.of({ errors: [formatErrorFn(e)] });
    }

    if (Array.isArray(requestParams)) {
      return Observable.of({ errors: [formatErrorFn(new Error('Websocket does not support batching'))] });
    }
    this._unsubscribe(requestParams.id);

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
      executeReactive: graphqlOptions.engine.executeReactive.bind(graphqlOptions.engine),
    };

    if (graphqlOptions.formatParams) {
      params = graphqlOptions.formatParams(params);
    }

    return runQueryReactive(params);
  }

  protected _validateRequest(request: WSRequest) {
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
        return;
    case 'cancel':
     // Allgood :)
     return;
    default:
     throw new Error('Invalid action used');
      }
  }
}
