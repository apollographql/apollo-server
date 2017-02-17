// This simplified polyfill attempts to follow the ECMAScript Observable proposal.
// See https://github.com/zenparsing/es-observable

import $$observable from 'symbol-observable';

export type CleanupFunction = () => void;
export type SubscriberFunction<T> = (observer: Observer<T>) => (Subscription | CleanupFunction);

function isSubscription(subscription: Function | Subscription): subscription is Subscription {
  return subscription &&
         (typeof subscription) !== 'function' &&
         (<Subscription>subscription).unsubscribe !== undefined;
}

export type IObserverOrNext<T> = ((value: T) => void | Observer<T>);

export interface IObservable<T> {
  subscribe(observer: Observer<T>): Subscription;
}

export interface Observer<T> {
  next?: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
}

export interface Subscription {
  unsubscribe: CleanupFunction;
  readonly closed: boolean;
}

class SubscriptionType {
  private _closed = false;
  constructor (private cleanup: CleanupFunction) {
  }

  public unsubscribe() {
    if ( false === this._closed ) {
      this.cleanup();
      this._closed = true;
    }
  }

  get closed(): boolean {
    return this._closed;
  }
}

export class Observable<T> implements IObservable<T> {
  public static of = <T>(value: T) => {
    return new Observable((observer: Observer<T>) => {
      observer.next(value);
      observer.complete();
      return () => {/* noop */};
    });
  }

  public static throw = (e: Error) => {
    return new Observable((observer) => {
      observer.error(e);
      return () => {/* noop */};
    });
  }

  public static empty = () => {
    return new Observable((observer) => {
      observer.complete();
      return () => {/* noop */};
    });
  }

  constructor(private subscriberFunction: SubscriberFunction<T>) { /* noop */ }

  /* istanbul ignore next */
  public [$$observable]() {
    return this;
  }

  public subscribe(observerOrNext: any, // TODO: why IObserverOrNext<T> not working?
                   error?: (error: Error) => void,
                   complete?: () => void): Subscription {
    if ( typeof observerOrNext === 'function' ) {
      return this._subscribe({
        next: observerOrNext as (value: T) => void,
        error: (e) => error ? error(e) : undefined,
        complete: () => complete ? complete() : undefined,
      } as Observer<T>);
    } else {
      return this._subscribe({
        next: (v: T) => observerOrNext.next(v),
        error: (e: Error) => observerOrNext.error(e),
        complete: () => observerOrNext.complete(),
      } as Observer<T>);
    }
  }

  private _subscribe(observer: Observer<T>): Subscription {
    let subscriptionOrCleanupFunction = this.subscriberFunction(observer);
    let unsubscribed = false;

    if (isSubscription(subscriptionOrCleanupFunction)) {
      return subscriptionOrCleanupFunction;
    } else {
      return new SubscriptionType(subscriptionOrCleanupFunction);
    }
  }
}
