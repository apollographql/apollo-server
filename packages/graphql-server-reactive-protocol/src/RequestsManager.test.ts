import { expect } from 'chai';
import { stub } from 'sinon';
import 'mocha';
import * as graphqlRxjs from 'graphql-rxjs';
import { Observable, Subject } from 'rxjs';
import { IObservable } from 'graphql-server-reactive-core';

import { RequestsManager } from './RequestsManager';
import { RGQLPacket } from './messageTypes';

describe.only('RequestsManager', () => {
  // const makeRequest = (pkt: RGQLPacket): IObservable<RGQLPacket> => {
  //   return new Observable((observer) => {

  //   });
  // };
  const wrapToRx = (o) => new Observable((observer) => o.subscribe(observer));

  it('passes sanity', () => {
    expect(RequestsManager).to.be.a('function');
  });

  it('has working keepAlive once configured', () => {
    const input = new Subject();
    const testTime = 124;
    const keepAliveValue = 25;
    const expectedResults = Math.floor(testTime / keepAliveValue);
    const reqMngr = new RequestsManager({
      schema: undefined,
      executor: {
        executeReactive: () => undefined,
      },
      keepAlive: keepAliveValue,
    }, input.asObservable());

    return wrapToRx(reqMngr.responseObservable)
      .bufferWhen(() => Observable.interval(testTime))
      .take(1).toPromise().then((res) => {
      expect(res).to.deep.equal(Array(expectedResults).fill({data: { type: 'keepalive' }}));
    });
  });

  it('does not output keepAlive if not configured', () => {
    const input = new Subject();
    const testTime = 124;
    const reqMngr = new RequestsManager({
      schema: undefined,
      executor: {
        executeReactive: () => undefined,
      },
    }, input.asObservable());

    return wrapToRx(reqMngr.responseObservable)
      .bufferWhen(() => Observable.interval(testTime))
      .take(1).toPromise().then((res) => {
      expect(res).to.deep.equal([]);
    });
  });
});
