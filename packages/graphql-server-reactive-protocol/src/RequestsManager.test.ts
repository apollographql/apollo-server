import { expect } from 'chai';
import { stub } from 'sinon';
import 'mocha';

import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
} from 'graphql';
import * as graphqlRxjs from 'graphql-rxjs';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { IObservable } from 'graphql-server-reactive-core';

import {
  RGQL_MSG_START,
  RGQL_MSG_DATA,
  RGQL_MSG_COMPLETE,
  RGQLPacket,
} from './messageTypes';
import { RequestsManager } from './RequestsManager';

const queryType = new GraphQLObjectType({
    name: 'QueryType',
    fields: {
        testString: {
            type: GraphQLString,
            resolve() {
                return 'it works';
            },
        },
        testError: {
            type: GraphQLString,
            resolve() {
                throw new Error('Secret error message');
            },
        },
    },
});

const schema = new GraphQLSchema({
    query: queryType,
});

describe('RequestsManager', () => {
  // const makeRequest = (pkt: RGQLPacket): IObservable<RGQLPacket> => {
  //   return new Observable((observer) => {

  //   });
  // };
  function wrapToRx<T>(o: IObservable<T>) {
    return new Observable<T>((observer) => o.subscribe(observer));
  }

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

  it('can handle simple requests', () => {
    const input = Observable.of(<RGQLPacket>{
      data: {
        id: 1,
        type: RGQL_MSG_START,
        payload: {
          query: `query { testString }`,
        },
      },
    });

    const expected = [
      {
        id: 1,
        type: RGQL_MSG_DATA,
        payload: {
          data: {
            testString: 'it works',
          },
        },
      },
      {
        id: 1,
        type: RGQL_MSG_COMPLETE,
      },
    ];

    const reqMngr = new RequestsManager({
      schema,
      executor: graphqlRxjs,
    }, input);

    return wrapToRx(reqMngr.responseObservable)
      .map((v) => v.data)
      .bufferCount(expected.length + 1)
      .toPromise().then((res) => {
      expect(res).to.deep.equal(expected);
    });
  });
});
