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
}

export class Observable<T> implements IObservable<T> {
  public static of = (value) => {
    return new Observable((observer) => {
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

  public subscribe(observer: Observer<T>): Subscription {
    let subscriptionOrCleanupFunction = this.subscriberFunction(observer);

    if (isSubscription(subscriptionOrCleanupFunction)) {
      return subscriptionOrCleanupFunction;
    } else {
      return {
        unsubscribe: subscriptionOrCleanupFunction,
      };
    }
  }
}
