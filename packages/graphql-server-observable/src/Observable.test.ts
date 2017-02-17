import { expect } from 'chai';
import { stub } from 'sinon';
import 'mocha';

import { Observer, Observable } from './Observable';
import { Observable as RxObservable } from 'rxjs';

describe('Observable', () => {
  function observableToPromise(obs) {
    return new Promise((resolve, reject) => {
      let err = undefined;
      let val = undefined;
      let sub;
      let complete = () => {
        process.nextTick(() => {
          sub.unsubscribe();
          err ? reject(err) : resolve(val);
        });
      };

      sub = obs.subscribe(
      (v) => {
          val = v;
      },
      (e) => {
        err = e;
        complete();
      },
      complete);
    });
  };

  async function observablesMatch(a, b) {
    let aval;
    let bval;
    let aerr;
    let berr;

    try {
      aval = await observableToPromise(a);
    } catch (e) {
      aerr = e;
    }

    try {
      bval = await observableToPromise(b);
    } catch (e) {
      berr = e;
    }

    if ( aerr || berr ) {
      if ( aerr && berr ) {
        expect(aerr.message).to.be.equals(berr.message);
      } else if ( aerr ) {
        console.error('observablesMatch error A', aerr);
        expect(aerr).to.be.equals(undefined);
      } else if ( berr ) {
        console.error('observablesMatch error b', berr);
        expect(berr).to.be.equals(undefined);
      }

      return;
    }

    expect(aval).to.deep.equal(bval);
    return aval;
  };

  it('passes sanity', () => {
    expect(Observable).to.be.a('function');
  });

  it('provides working empty()', () => {
    return observablesMatch(RxObservable.empty(), Observable.empty());
  });

  it('provides working throw()', () => {
    let err = new Error('error for test');
    return observablesMatch(RxObservable.throw(err),
                            Observable.throw(err));
  });

  it('provides working of()', () => {
    let val = 'something';
    return observablesMatch(RxObservable.of(val),
                            Observable.of(val));
  });

  it('is able to wrap observable', () => {
    let originalObs = Observable.of<string>('Original');
    let craftedObs = new Observable<string>((observer: Observer<string>) => {
      // same observable type, we can take shortcut.
      return originalObs.subscribe(observer);
    });
    return observablesMatch(originalObs, craftedObs);
  });

  it('is able to wrap RxJs', () => {
    let originalObs = RxObservable.of('Original');
    let craftedObs = new Observable((observer) => {
      return originalObs.subscribe(observer.next, observer.error, observer.complete);
    });
    return observablesMatch(originalObs, craftedObs);
  });

  it('is able to be wrapped by RxJs', () => {
    let originalObs = Observable.of('Original');
    let craftedObs = new RxObservable((observer) => {
      return originalObs.subscribe(observer);
    });
    return observablesMatch(originalObs, craftedObs);
  });
});
