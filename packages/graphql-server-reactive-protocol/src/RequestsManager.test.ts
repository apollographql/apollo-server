import { expect } from 'chai';
import { stub } from 'sinon';
import 'mocha';

import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLInt,
  GraphQLNonNull,
  ExecutionResult,
} from 'graphql';
import * as graphqlRxjs from 'graphql-rxjs';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { IObservable } from 'graphql-server-reactive-core';

import {
  RGQL_MSG_START,
  RGQL_MSG_DATA,
  RGQL_MSG_STOP,
  RGQL_MSG_ERROR,
  RGQL_MSG_COMPLETE,
  RGQLPacket,
  RGQLPacketData,
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

const subscriptionType = new GraphQLObjectType({
    name: 'SubscriptionType',
    fields: {
        testInterval: {
            type: GraphQLInt,
            args: {
              interval: {
                type: new GraphQLNonNull(GraphQLInt),
              },
            },
            resolve(root, args, ctx) {
                return Observable.interval(args['interval']);
            },
        },
    },
});

const schema = new GraphQLSchema({
    query: queryType,
    subscription: subscriptionType,
});

describe.only('RequestsManager', () => {
  function wrapToRx<T>(o: IObservable<T>) {
    return new Observable<T>((observer) => o.subscribe(observer));
  }

  function expectError(data: RGQLPacketData, message: string, forceId: boolean = true) {
    const reqId = Math.floor(Math.random() * 1000) + 1;
    const inputPacket = <RGQLPacket>{
      data: Object.assign({}, data, forceId ? { id : reqId } : {}),
    };
    const input = Observable.of(inputPacket);
    const expected = <RGQLPacketData[]> [
      Object.assign({
        type: RGQL_MSG_ERROR,
        payload: undefined,
        ...(inputPacket.data.id) ? { id: inputPacket.data.id } : {},
      }),
    ];

    const reqMngr = new RequestsManager({
      schema,
      executor: graphqlRxjs,
    }, input);

    return wrapToRx(reqMngr.responseObservable)
      .map((v) => v.data)
      .bufferCount(expected.length + 1)
      .toPromise().then((res) => {
      const e: Error = res[0].payload as Error;
      expect(e.message).to.be.equals(message);

      expected[0].payload = e;
      expect(res).to.deep.equal(expected);
    });

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

  it('returns error if invalid msg type sent', () => {
    return expectError({
      id: undefined,
      type: 'invalid' as any,
      payload: {
        query: `query { testString }`,
      },
    }, 'Request has invalid type');
  });

  it('returns error if no id sent', () => {
    return expectError({
      id: undefined,
      type: RGQL_MSG_START,
      payload: {
        query: `query { testString }`,
      },
    }, 'Request is missing id field', false);
  });

  it('returns error if no type sent', () => {
    return expectError({
      id: undefined,
      type: undefined,
      payload: undefined,
    }, 'Request is missing type field');
  });

  it('returns error if no payload sent with start', () => {
    return expectError({
      id: undefined,
      type: RGQL_MSG_START,
      payload: undefined,
    }, 'Request is missing payload field');
  });

  it('returns error if no payload.query sent with start', () => {
    return expectError({
      id: undefined,
      type: RGQL_MSG_START,
      payload: {
      },
    }, 'Request is missing payload.query field');
  });

  it('returns error on batching', () => {
    return expectError({
      id: undefined,
      type: RGQL_MSG_START,
      payload: [{
        query: `query { testString }`,
      }, {
        query: `subscription { testInterval(interval: 10) }`,
      }],
    }, 'interface does does not support batching');
  });

  it('returns error if invalid variables sent', () => {
    return expectError({
      id: undefined,
      type: RGQL_MSG_START,
      payload: {
        query: `subscription interval($interval: Int!) { testInterval(interval: $interval) }`,
        // Invalid json
        variables: `{"interval": "aaaaaa}`,
      },
    }, 'Variables are invalid JSON.');
  });

  it('able to subscribe to changes', () => {
    const input = Observable.from(<Observable<RGQLPacket>[]>[
    Observable.of({
      data: {
        id: 1,
        type: RGQL_MSG_START,
        payload: {
          query: `subscription { testInterval(interval: 25) }`,
        },
      },
    }),
    Observable.of({
      data: {
        id: 1,
        type: RGQL_MSG_STOP,
      },
    }).delay(124)]).concatAll();

    const expected = [];
    for ( let i = 0 ; i < 4 ; i ++ ) {
      expected.push({
        id: 1,
        type: RGQL_MSG_DATA,
        payload: {
          data: {
            testInterval: i,
          },
        },
      });
    }
    expected.push({
      id: 1,
      type: RGQL_MSG_COMPLETE,
    });

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

  it('able to subscribe with variables', () => {
    const input = Observable.from(<Observable<RGQLPacket>[]>[
    Observable.of({
      data: {
        id: 1,
        type: RGQL_MSG_START,
        payload: {
          query: `subscription interval($interval: Int!) { testInterval(interval: $interval) }`,
          variables: `{"interval": 25}`,
        },
      },
    }),
    Observable.of({
      data: {
        id: 1,
        type: RGQL_MSG_STOP,
      },
    }).delay(120)]).concatAll();

    const expected = [];
    for ( let i = 0 ; i < 4 ; i ++ ) {
      expected.push({
        id: 1,
        type: RGQL_MSG_DATA,
        payload: {
          data: {
            testInterval: i,
          },
        },
      });
    }
    expected.push({
      id: 1,
      type: RGQL_MSG_COMPLETE,
    });

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

  it('runs formatParams if provided', () => {
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
    let requestParamsRun = false;

    const reqMngr = new RequestsManager({
      schema,
      formatParams: (p) => {
        requestParamsRun = true;
        return p;
      },
      executor: graphqlRxjs,
    }, input);

    return wrapToRx(reqMngr.responseObservable)
      .map((v) => v.data)
      .bufferCount(expected.length + 1)
      .toPromise().then((res) => {
      expect(res).to.deep.equal(expected);
      expect(requestParamsRun).to.be.equals(true);
    });
  });

  it('able to preserve metadata', () => {
    const inputPacket: RGQLPacket = {
      metadata: "packet-info",
      data: {
        id: 1,
        type: RGQL_MSG_START,
        payload: {
          query: `query { testString }`,
        },
      },
    };
    const input = Observable.of(inputPacket);

    const expected = [{
        metadata: "packet-info",
        data: {
          id: 1,
          type: RGQL_MSG_DATA,
          payload: {
            data: {
              testString: 'it works',
            },
          },
        },
    }, {
      metadata: "packet-info",
      data: {
        id: 1,
        type: RGQL_MSG_COMPLETE,
      },
    }];

    const reqMngr = new RequestsManager({
      schema,
      executor: graphqlRxjs,
    }, input);

    return wrapToRx(reqMngr.responseObservable)
      .bufferCount(expected.length + 1)
      .toPromise().then((res) => {
      expect(res).to.deep.equal(expected);
    });
  });
});
