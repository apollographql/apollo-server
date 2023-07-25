import {
  ApolloServer,
  ApolloServerOptionsWithTypeDefs,
  BaseContext,
  HeaderMap,
} from '@apollo/server';
import { ApolloServerPluginSubscriptionCallback } from '@apollo/server/plugin/subscriptionCallback';
import { Logger } from '@apollo/utils.logger';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import assert from 'assert';
import { PubSub } from 'graphql-subscriptions';
import nock from 'nock';
import { nockAfterEach, nockBeforeEach } from '../../nockAssertions';

describe('SubscriptionCallbackPlugin', () => {
  let logger: Logger & { orderOfOperations: string[] };
  beforeEach(() => {
    logger = orderOfOperationsLogger();
    nockBeforeEach();
  });

  afterEach(nockAfterEach);

  beforeAll(() => {
    // This explicitly mocks only `setInterval` and `clearInterval` for the
    // heartbeat.
    jest.useFakeTimers({
      doNotFake: [
        'Date',
        'hrtime',
        'nextTick',
        'performance',
        'queueMicrotask',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'requestIdleCallback',
        'cancelIdleCallback',
        'setImmediate',
        'clearImmediate',
        'setTimeout',
        'clearTimeout',
      ],
    });
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('simple happy path', async () => {
    const server = await startSubscriptionServer({ logger });

    // Mock the initial check response from the router.
    mockRouterCheckResponse();

    // Start the subscription; this triggers the initial check request and
    // starts the heartbeat interval. This simulates an incoming subscription
    // request from the router.
    const result = await server.executeOperation({
      query: `#graphql
        subscription {
          count
        }
      `,
      extensions: {
        subscription: {
          callback_url: 'http://mock-router-url.com',
          subscription_id: '1234-cats',
          verifier: 'my-verifier-token',
        },
      },
    });

    expect(result.http.status).toEqual(200);

    // Mock the heartbeat response from the router. We'll trigger it once below
    // after the subscription is initialized to make sure it works.
    const firstHeartbeat = mockRouterHeartbeatResponse();
    // Advance timers to trigger the heartbeat once. This consumes the one
    // heartbeat mock from above.
    jest.advanceTimersByTime(5000);
    await firstHeartbeat;

    // Next we'll trigger some subscription events. In advance, we'll mock the 2
    // router responses.
    const updates = Promise.all([
      mockRouterNextResponse({ payload: { count: 1 } }),
      mockRouterNextResponse({
        payload: { count: 2 },
      }),
    ]);

    // Trigger a couple updates. These send `next` requests to the router.
    logger.debug('TESTING: Triggering first update');
    await server.executeOperation({
      query: `#graphql
        mutation {
          addOne
        }
      `,
    });

    logger.debug('TESTING: Triggering second update');
    await server.executeOperation({
      query: `#graphql
        mutation {
          addOne
        }
      `,
    });
    await updates;

    // When we shutdown the server, we'll stop listening for subscription
    // updates, await unresolved requests, and send a `complete` request to the
    // router for each active subscription.
    const completeRequest = mockRouterCompleteResponse();

    await server.stop();
    await completeRequest;

    // The heartbeat should be cleaned up at this point. There is no second
    // heartbeat mock, so if it ticks again it'll throw an error.
    jest.advanceTimersByTime(5000);

    expect(logger.orderOfOperations).toMatchInlineSnapshot(`
      [
        "SubscriptionCallback[1234-cats]: Received new subscription request",
        "SubscriptionManager[1234-cats]: Sending \`check\` request to router",
        "SubscriptionManager[1234-cats]: \`check\` request successful",
        "SubscriptionCallback[1234-cats]: Starting graphql-js subscription",
        "SubscriptionCallback[1234-cats]: graphql-js subscription successful",
        "SubscriptionManager[1234-cats]: Starting new heartbeat interval for http://mock-router-url.com",
        "SubscriptionManager[1234-cats]: Listening to graphql-js subscription",
        "SubscriptionCallback[1234-cats]: Responding to original subscription request",
        "SubscriptionManager: Sending \`heartbeat\` request to http://mock-router-url.com for IDs: [1234-cats]",
        "SubscriptionManager: Heartbeat received response for IDs: [1234-cats]",
        "SubscriptionManager: Heartbeat request successful, IDs: [1234-cats]",
        "TESTING: Triggering first update",
        "SubscriptionManager[1234-cats]: Sending \`next\` request to router",
        "TESTING: Triggering second update",
        "SubscriptionManager[1234-cats]: \`next\` request successful",
        "SubscriptionManager[1234-cats]: Sending \`next\` request to router",
        "SubscriptionManager[1234-cats]: \`next\` request successful",
        "SubscriptionCallback: Server is shutting down. Cleaning up outstanding subscriptions and heartbeat intervals",
        "SubscriptionManager[1234-cats]: Sending \`complete\` request to router",
        "SubscriptionManager[1234-cats]: \`complete\` request successful",
        "SubscriptionManager: Terminating subscriptions for IDs: [1234-cats]",
        "SubscriptionManager: Terminating heartbeat interval, no more subscriptions for http://mock-router-url.com",
        "SubscriptionCallback: Successfully cleaned up outstanding subscriptions and heartbeat intervals.",
      ]
    `);
  });

  it('handles multiple callback urls', async () => {
    const server = await startSubscriptionServer({ logger });
    const router2 = {
      url: 'http://mock-router-url-2.com',
      id: '5678-dogs',
      verifier: 'another-verifier-token',
    };
    // Mock the initial check response from the 2 callback urls.
    mockRouterCheckResponse();
    mockRouterCheckResponse({ requestOpts: router2 });

    // Mock the heartbeat response from the routers. We'll trigger it once below
    // after the subscriptions are initialized to make sure it works.
    const heartbeats = Promise.all([
      mockRouterHeartbeatResponse(),
      mockRouterHeartbeatResponse({ requestOptions: router2 }),
    ]);

    // Start the subscriptions.
    const router1Result = await server.executeOperation({
      query: `#graphql
        subscription {
          count
        }
      `,
      extensions: {
        subscription: {
          callback_url: 'http://mock-router-url.com',
          subscription_id: '1234-cats',
          verifier: 'my-verifier-token',
        },
      },
    });
    const router2Result = await server.executeOperation({
      query: `#graphql
        subscription {
          count
        }
      `,
      extensions: {
        subscription: {
          callback_url: router2.url,
          subscription_id: router2.id,
          verifier: router2.verifier,
        },
      },
    });
    expect(router1Result.http.status).toEqual(200);
    expect(router2Result.http.status).toEqual(200);

    // Advance timers to trigger the heartbeat once. This consumes the
    // heartbeat mocks from above (one per router).
    jest.advanceTimersByTime(5000);
    await heartbeats;

    // Next we'll trigger some subscription events. In advance, we'll mock the 2
    // router responses.
    const firstUpdate = Promise.all([
      mockRouterNextResponse({ payload: { count: 1 } }),
      mockRouterNextResponse({ payload: { count: 1 }, ...router2 }),
    ]);
    const secondUpdate = Promise.all([
      mockRouterNextResponse({ payload: { count: 2 } }),
      mockRouterNextResponse({ payload: { count: 2 }, ...router2 }),
    ]);

    // Trigger a couple updates. These send `next` requests to the router.
    logger.debug('TESTING: Triggering first update');
    await server.executeOperation({
      query: `#graphql
        mutation {
          addOne
        }
      `,
    });
    await firstUpdate;

    logger.debug('TESTING: Triggering second update');
    await server.executeOperation({
      query: `#graphql
        mutation {
          addOne
        }
      `,
    });
    await secondUpdate;

    // When we shutdown the server, we'll stop listening for subscription
    // updates, await unresolved requests, and send a `complete` request to the
    // router for each active subscription.
    const completeRequests = Promise.all([
      mockRouterCompleteResponse(),
      mockRouterCompleteResponse(router2),
    ]);

    await server.stop();
    await completeRequests;

    // The heartbeat should be cleaned up at this point. There is no second
    // heartbeat mock, so if it ticks again it'll throw an error.
    jest.advanceTimersByTime(5000);

    expect(logger.orderOfOperations).toMatchInlineSnapshot(`
      [
        "SubscriptionCallback[1234-cats]: Received new subscription request",
        "SubscriptionManager[1234-cats]: Sending \`check\` request to router",
        "SubscriptionManager[1234-cats]: \`check\` request successful",
        "SubscriptionCallback[1234-cats]: Starting graphql-js subscription",
        "SubscriptionCallback[1234-cats]: graphql-js subscription successful",
        "SubscriptionManager[1234-cats]: Starting new heartbeat interval for http://mock-router-url.com",
        "SubscriptionManager[1234-cats]: Listening to graphql-js subscription",
        "SubscriptionCallback[1234-cats]: Responding to original subscription request",
        "SubscriptionCallback[5678-dogs]: Received new subscription request",
        "SubscriptionManager[5678-dogs]: Sending \`check\` request to router",
        "SubscriptionManager[5678-dogs]: \`check\` request successful",
        "SubscriptionCallback[5678-dogs]: Starting graphql-js subscription",
        "SubscriptionCallback[5678-dogs]: graphql-js subscription successful",
        "SubscriptionManager[5678-dogs]: Starting new heartbeat interval for http://mock-router-url-2.com",
        "SubscriptionManager[5678-dogs]: Listening to graphql-js subscription",
        "SubscriptionCallback[5678-dogs]: Responding to original subscription request",
        "SubscriptionManager: Sending \`heartbeat\` request to http://mock-router-url.com for IDs: [1234-cats]",
        "SubscriptionManager: Sending \`heartbeat\` request to http://mock-router-url-2.com for IDs: [5678-dogs]",
        "SubscriptionManager: Heartbeat received response for IDs: [1234-cats]",
        "SubscriptionManager: Heartbeat request successful, IDs: [1234-cats]",
        "SubscriptionManager: Heartbeat received response for IDs: [5678-dogs]",
        "SubscriptionManager: Heartbeat request successful, IDs: [5678-dogs]",
        "TESTING: Triggering first update",
        "SubscriptionManager[1234-cats]: Sending \`next\` request to router",
        "SubscriptionManager[5678-dogs]: Sending \`next\` request to router",
        "SubscriptionManager[1234-cats]: \`next\` request successful",
        "SubscriptionManager[5678-dogs]: \`next\` request successful",
        "TESTING: Triggering second update",
        "SubscriptionManager[1234-cats]: Sending \`next\` request to router",
        "SubscriptionManager[5678-dogs]: Sending \`next\` request to router",
        "SubscriptionManager[1234-cats]: \`next\` request successful",
        "SubscriptionManager[5678-dogs]: \`next\` request successful",
        "SubscriptionCallback: Server is shutting down. Cleaning up outstanding subscriptions and heartbeat intervals",
        "SubscriptionManager[1234-cats]: Sending \`complete\` request to router",
        "SubscriptionManager[5678-dogs]: Sending \`complete\` request to router",
        "SubscriptionManager[1234-cats]: \`complete\` request successful",
        "SubscriptionManager: Terminating subscriptions for IDs: [1234-cats]",
        "SubscriptionManager: Terminating heartbeat interval, no more subscriptions for http://mock-router-url.com",
        "SubscriptionManager[5678-dogs]: \`complete\` request successful",
        "SubscriptionManager: Terminating subscriptions for IDs: [5678-dogs]",
        "SubscriptionManager: Terminating heartbeat interval, no more subscriptions for http://mock-router-url-2.com",
        "SubscriptionCallback: Successfully cleaned up outstanding subscriptions and heartbeat intervals.",
      ]
    `);
  });

  it('updates id/verifier on heartbeat response with 400 + invalid IDs', async () => {
    const server = await startSubscriptionServer({ logger });
    const secondSubscription = {
      id: '5678-dogs',
      verifier: 'another-verifier-token',
    };

    mockRouterCheckResponse();
    mockRouterCheckResponse({ requestOpts: secondSubscription });

    // Start the subscriptions; this triggers the initial check request and
    // starts the heartbeat interval. This simulates an incoming subscription
    // request from the router.
    const firstResult = await server.executeOperation({
      query: `#graphql
        subscription {
          count
        }
      `,
      extensions: {
        subscription: {
          callback_url: 'http://mock-router-url.com',
          subscription_id: '1234-cats',
          verifier: 'my-verifier-token',
        },
      },
    });

    expect(firstResult.http.status).toEqual(200);

    const secondResult = await server.executeOperation({
      query: `#graphql
        subscription {
          count
        }
      `,
      extensions: {
        subscription: {
          callback_url: 'http://mock-router-url.com',
          subscription_id: secondSubscription.id,
          verifier: secondSubscription.verifier,
        },
      },
    });

    expect(secondResult.http.status).toEqual(200);

    // Trigger a heartbeat once to make sure it's working
    const firstHeartbeat = mockRouterHeartbeatResponse({
      requestOptions: {
        ids: ['1234-cats', secondSubscription.id],
      },
    });
    jest.advanceTimersByTime(5000);
    await firstHeartbeat;

    // Next we'll trigger some subscription events. In advance, we'll mock the 2
    // router responses.
    const firstUpdate = Promise.all([
      mockRouterNextResponse({ payload: { count: 1 } }),
      mockRouterNextResponse({ payload: { count: 1 }, ...secondSubscription }),
    ]);

    // This promise is a testing detail - we need to wait for the second update
    // to fully resolve or else the server will stop and clean everything up
    // before the mock is consumed. It resolves when the mock replies.
    const secondUpdate = Promise.all([
      mockRouterNextResponse({ payload: { count: 2 } }),
      mockRouterNextResponse({ payload: { count: 2 }, ...secondSubscription }),
    ]);

    // Trigger a couple updates. These send `next` requests to the router.
    logger.debug('TESTING: Triggering first update');
    await server.executeOperation({
      query: `#graphql
        mutation {
          addOne
        }
      `,
    });
    await firstUpdate;

    logger.debug('TESTING: Triggering second update');
    await server.executeOperation({
      query: `#graphql
        mutation {
          addOne
        }
      `,
    });
    await secondUpdate;

    // We've established two subscriptions are functional at this point. Now
    // let's have the router invalidate one with a 400 heartbeat.
    const heartbeatWithInvalidIds = mockRouterHeartbeatResponse({
      requestOptions: {
        id: '1234-cats',
        ids: ['1234-cats', secondSubscription.id],
        verifier: 'my-verifier-token',
      },
      statusCode: 400,
      responseBody: {
        id: 'updated-subscription-id',
        ids: ['1234-cats'],
        invalid_ids: [secondSubscription.id],
        verifier: 'updated-verifier-token',
      },
    });

    jest.advanceTimersByTime(5000);
    await heartbeatWithInvalidIds;

    // A subsequent heartbeat should use the updated id/verifier, and the second
    // subscription should be excluded.
    const updatedHeartbeat = mockRouterHeartbeatResponse({
      requestOptions: {
        id: 'updated-subscription-id',
        ids: ['1234-cats'],
        verifier: 'updated-verifier-token',
      },
    });

    jest.advanceTimersByTime(5000);
    await updatedHeartbeat;

    const thirdUpdate = mockRouterNextResponse({
      payload: { count: 3 },
    });
    // Trigger a 3rd update to make sure the second subscription is
    // excluded.
    logger.debug('TESTING: Triggering third update');
    await server.executeOperation({
      query: `#graphql
        mutation {
          addOne
        }
      `,
    });

    await thirdUpdate;
    // When we shutdown the server, we'll stop listening for subscription
    // updates, await unresolved requests, and send a `complete` request to the
    // router for each active subscription.
    mockRouterCompleteResponse();

    await server.stop();

    // The heartbeat should be cleaned up at this point. There is no additional
    // heartbeat mock, so if it ticks again it'll throw an error.
    jest.advanceTimersByTime(5000);

    expect(logger.orderOfOperations).toMatchInlineSnapshot(`
      [
        "SubscriptionCallback[1234-cats]: Received new subscription request",
        "SubscriptionManager[1234-cats]: Sending \`check\` request to router",
        "SubscriptionManager[1234-cats]: \`check\` request successful",
        "SubscriptionCallback[1234-cats]: Starting graphql-js subscription",
        "SubscriptionCallback[1234-cats]: graphql-js subscription successful",
        "SubscriptionManager[1234-cats]: Starting new heartbeat interval for http://mock-router-url.com",
        "SubscriptionManager[1234-cats]: Listening to graphql-js subscription",
        "SubscriptionCallback[1234-cats]: Responding to original subscription request",
        "SubscriptionCallback[5678-dogs]: Received new subscription request",
        "SubscriptionManager[5678-dogs]: Sending \`check\` request to router",
        "SubscriptionManager[5678-dogs]: \`check\` request successful",
        "SubscriptionCallback[5678-dogs]: Starting graphql-js subscription",
        "SubscriptionCallback[5678-dogs]: graphql-js subscription successful",
        "SubscriptionManager[5678-dogs]: Heartbeat interval already exists for http://mock-router-url.com, reusing existing interval",
        "SubscriptionManager[5678-dogs]: Listening to graphql-js subscription",
        "SubscriptionCallback[5678-dogs]: Responding to original subscription request",
        "SubscriptionManager: Sending \`heartbeat\` request to http://mock-router-url.com for IDs: [1234-cats,5678-dogs]",
        "SubscriptionManager: Heartbeat received response for IDs: [1234-cats,5678-dogs]",
        "SubscriptionManager: Heartbeat request successful, IDs: [1234-cats,5678-dogs]",
        "TESTING: Triggering first update",
        "SubscriptionManager[1234-cats]: Sending \`next\` request to router",
        "SubscriptionManager[5678-dogs]: Sending \`next\` request to router",
        "SubscriptionManager[1234-cats]: \`next\` request successful",
        "SubscriptionManager[5678-dogs]: \`next\` request successful",
        "TESTING: Triggering second update",
        "SubscriptionManager[1234-cats]: Sending \`next\` request to router",
        "SubscriptionManager[5678-dogs]: Sending \`next\` request to router",
        "SubscriptionManager[1234-cats]: \`next\` request successful",
        "SubscriptionManager[5678-dogs]: \`next\` request successful",
        "SubscriptionManager: Sending \`heartbeat\` request to http://mock-router-url.com for IDs: [1234-cats,5678-dogs]",
        "SubscriptionManager: Heartbeat received response for IDs: [1234-cats,5678-dogs]",
        "SubscriptionManager: Heartbeat request received invalid IDs: [5678-dogs]",
        "SubscriptionManager: Terminating subscriptions for IDs: [5678-dogs]",
        "SubscriptionManager: Sending \`heartbeat\` request to http://mock-router-url.com for IDs: [1234-cats]",
        "SubscriptionManager: Heartbeat received response for IDs: [1234-cats]",
        "SubscriptionManager: Heartbeat request successful, IDs: [1234-cats]",
        "TESTING: Triggering third update",
        "SubscriptionManager[1234-cats]: Sending \`next\` request to router",
        "SubscriptionManager[5678-dogs]: Subscription already cancelled, ignoring current and future payloads",
        "SubscriptionManager[1234-cats]: \`next\` request successful",
        "SubscriptionCallback: Server is shutting down. Cleaning up outstanding subscriptions and heartbeat intervals",
        "SubscriptionManager[1234-cats]: Sending \`complete\` request to router",
        "SubscriptionManager[1234-cats]: \`complete\` request successful",
        "SubscriptionManager: Terminating subscriptions for IDs: [1234-cats]",
        "SubscriptionManager: Terminating heartbeat interval, no more subscriptions for http://mock-router-url.com",
        "SubscriptionCallback: Successfully cleaned up outstanding subscriptions and heartbeat intervals.",
      ]
    `);
  });

  it('cancels heartbeat on 404 (all IDs invalid)', async () => {
    const server = await startSubscriptionServer({ logger });
    const secondSubscription = {
      id: '5678-dogs',
      verifier: 'another-verifier-token',
    };

    mockRouterCheckResponse();
    mockRouterCheckResponse({ requestOpts: secondSubscription });
    // Mock the heartbeat response from the router. We'll trigger it once below
    // after the subscription is initialized to make sure it works.
    const firstHeartbeat = mockRouterHeartbeatResponse({
      requestOptions: {
        ids: ['1234-cats', secondSubscription.id],
      },
    });

    // Start the subscriptions; this triggers the initial check request and
    // starts the heartbeat interval. This simulates an incoming subscription
    // request from the router.
    const firstResult = await server.executeOperation({
      query: `#graphql
        subscription {
          count
        }
      `,
      extensions: {
        subscription: {
          callback_url: 'http://mock-router-url.com',
          subscription_id: '1234-cats',
          verifier: 'my-verifier-token',
        },
      },
    });

    expect(firstResult.http.status).toEqual(200);

    const secondResult = await server.executeOperation({
      query: `#graphql
        subscription {
          count
        }
      `,
      extensions: {
        subscription: {
          callback_url: 'http://mock-router-url.com',
          subscription_id: secondSubscription.id,
          verifier: secondSubscription.verifier,
        },
      },
    });

    expect(secondResult.http.status).toEqual(200);

    // Advance timers to trigger the heartbeat. This consumes the one
    // heartbeat mock from above.
    jest.advanceTimersByTime(5000);
    await firstHeartbeat;

    // Next we'll trigger some subscription events. In advance, we'll mock the
    // router responses.
    const firstUpdate = Promise.all([
      mockRouterNextResponse({ payload: { count: 1 } }),
      mockRouterNextResponse({ payload: { count: 1 }, ...secondSubscription }),
    ]);

    const secondUpdate = Promise.all([
      mockRouterNextResponse({ payload: { count: 2 } }),
      mockRouterNextResponse({ payload: { count: 2 }, ...secondSubscription }),
    ]);

    // Trigger a couple updates. These send `next` requests to the router.
    logger.debug('TESTING: Triggering first update');
    await server.executeOperation({
      query: `#graphql
        mutation {
          addOne
        }
      `,
    });

    await firstUpdate;

    logger.debug('TESTING: Triggering second update');
    await server.executeOperation({
      query: `#graphql
        mutation {
          addOne
        }
      `,
    });

    await secondUpdate;

    // We've established two subscriptions are functional at this point. Now
    // let's have the router invalidate them with a 404 heartbeat.
    const secondHeartbeat = mockRouterHeartbeatResponse({
      requestOptions: {
        id: '1234-cats',
        ids: ['1234-cats', secondSubscription.id],
        verifier: 'my-verifier-token',
      },
      statusCode: 404,
    });

    jest.advanceTimersByTime(5000);
    await secondHeartbeat;

    // Trigger a 3rd update to make sure both subscriptions are cancelled.
    logger.debug('TESTING: Triggering third update');
    await server.executeOperation({
      query: `#graphql
        mutation {
          addOne
        }
      `,
    });

    // The heartbeat should be cleaned up at this point. There is no remaining
    // heartbeat mock, so if it ticks again it'll throw an error.
    jest.advanceTimersByTime(5000);

    await server.stop();

    expect(logger.orderOfOperations).toMatchInlineSnapshot(`
      [
        "SubscriptionCallback[1234-cats]: Received new subscription request",
        "SubscriptionManager[1234-cats]: Sending \`check\` request to router",
        "SubscriptionManager[1234-cats]: \`check\` request successful",
        "SubscriptionCallback[1234-cats]: Starting graphql-js subscription",
        "SubscriptionCallback[1234-cats]: graphql-js subscription successful",
        "SubscriptionManager[1234-cats]: Starting new heartbeat interval for http://mock-router-url.com",
        "SubscriptionManager[1234-cats]: Listening to graphql-js subscription",
        "SubscriptionCallback[1234-cats]: Responding to original subscription request",
        "SubscriptionCallback[5678-dogs]: Received new subscription request",
        "SubscriptionManager[5678-dogs]: Sending \`check\` request to router",
        "SubscriptionManager[5678-dogs]: \`check\` request successful",
        "SubscriptionCallback[5678-dogs]: Starting graphql-js subscription",
        "SubscriptionCallback[5678-dogs]: graphql-js subscription successful",
        "SubscriptionManager[5678-dogs]: Heartbeat interval already exists for http://mock-router-url.com, reusing existing interval",
        "SubscriptionManager[5678-dogs]: Listening to graphql-js subscription",
        "SubscriptionCallback[5678-dogs]: Responding to original subscription request",
        "SubscriptionManager: Sending \`heartbeat\` request to http://mock-router-url.com for IDs: [1234-cats,5678-dogs]",
        "SubscriptionManager: Heartbeat received response for IDs: [1234-cats,5678-dogs]",
        "SubscriptionManager: Heartbeat request successful, IDs: [1234-cats,5678-dogs]",
        "TESTING: Triggering first update",
        "SubscriptionManager[1234-cats]: Sending \`next\` request to router",
        "SubscriptionManager[5678-dogs]: Sending \`next\` request to router",
        "SubscriptionManager[1234-cats]: \`next\` request successful",
        "SubscriptionManager[5678-dogs]: \`next\` request successful",
        "TESTING: Triggering second update",
        "SubscriptionManager[1234-cats]: Sending \`next\` request to router",
        "SubscriptionManager[5678-dogs]: Sending \`next\` request to router",
        "SubscriptionManager[1234-cats]: \`next\` request successful",
        "SubscriptionManager[5678-dogs]: \`next\` request successful",
        "SubscriptionManager: Sending \`heartbeat\` request to http://mock-router-url.com for IDs: [1234-cats,5678-dogs]",
        "SubscriptionManager: Heartbeat received response for IDs: [1234-cats,5678-dogs]",
        "SubscriptionManager: Heartbeat request received invalid IDs: [1234-cats,5678-dogs]",
        "SubscriptionManager: Terminating subscriptions for IDs: [1234-cats,5678-dogs]",
        "SubscriptionManager: Terminating heartbeat interval, no more subscriptions for http://mock-router-url.com",
        "TESTING: Triggering third update",
        "SubscriptionManager[1234-cats]: Subscription already cancelled, ignoring current and future payloads",
        "SubscriptionManager[5678-dogs]: Subscription already cancelled, ignoring current and future payloads",
        "SubscriptionCallback: Server is shutting down. Cleaning up outstanding subscriptions and heartbeat intervals",
        "SubscriptionCallback: Successfully cleaned up outstanding subscriptions and heartbeat intervals.",
      ]
    `);
  });

  it('sends a `complete` when a subscription terminates successfully', async () => {
    const server = await startSubscriptionServer({ logger });

    // Mock the initial check response from the router.
    mockRouterCheckResponse();
    // Mock the first response from the router in response to the first
    // subscription event / update
    mockRouterNextResponse({
      payload: { terminatesSuccessfully: true },
    });
    // The subscription completes after the first update, so it should fire a
    // `complete` request to the router.
    const completeRequest = mockRouterCompleteResponse();

    // Start the subscription; this triggers the initial check request and
    // starts the heartbeat interval. This simulates an incoming subscription
    // request from the router.
    const result = await server.executeOperation({
      query: `#graphql
        subscription {
          terminatesSuccessfully
        }
      `,
      extensions: {
        subscription: {
          callback_url: 'http://mock-router-url.com',
          subscription_id: '1234-cats',
          verifier: 'my-verifier-token',
        },
      },
    });
    // The response to the router's initial request should be status 200
    expect(result.http.status).toEqual(200);

    await completeRequest;

    // The heartbeat should be cleaned up at this point. There is no remaining
    // heartbeat mock, so if it ticks again it'll throw an error.
    jest.advanceTimersByTime(5000);

    // When we shutdown the server, we'll stop listening for subscription
    // updates, await unresolved requests, and send a `complete` request to the
    // router for each active subscription (in this case they've already
    // completed themselves and cleaned up before this is called).
    await server.stop();

    expect(logger.orderOfOperations).toMatchInlineSnapshot(`
      [
        "SubscriptionCallback[1234-cats]: Received new subscription request",
        "SubscriptionManager[1234-cats]: Sending \`check\` request to router",
        "SubscriptionManager[1234-cats]: \`check\` request successful",
        "SubscriptionCallback[1234-cats]: Starting graphql-js subscription",
        "SubscriptionCallback[1234-cats]: graphql-js subscription successful",
        "SubscriptionManager[1234-cats]: Starting new heartbeat interval for http://mock-router-url.com",
        "SubscriptionManager[1234-cats]: Listening to graphql-js subscription",
        "SubscriptionCallback[1234-cats]: Responding to original subscription request",
        "SubscriptionManager[1234-cats]: Sending \`next\` request to router",
        "SubscriptionManager[1234-cats]: \`next\` request successful",
        "SubscriptionManager[1234-cats]: Subscription completed without errors",
        "SubscriptionManager[1234-cats]: Sending \`complete\` request to router",
        "SubscriptionManager[1234-cats]: \`complete\` request successful",
        "SubscriptionManager: Terminating subscriptions for IDs: [1234-cats]",
        "SubscriptionManager: Terminating heartbeat interval, no more subscriptions for http://mock-router-url.com",
        "SubscriptionCallback: Server is shutting down. Cleaning up outstanding subscriptions and heartbeat intervals",
        "SubscriptionCallback: Successfully cleaned up outstanding subscriptions and heartbeat intervals.",
      ]
    `);
  });

  describe('error handling', () => {
    it('encounters errors on initial `check`', async () => {
      const server = await startSubscriptionServer({ logger });

      // Mock the failed check response from the router.
      mockRouterCheckResponse({
        statusCode: 400,
        responseBody: 'Invalid subscription ID provided',
      });

      // This triggers the check request which will fail.
      const result = await server.executeHTTPGraphQLRequest({
        httpGraphQLRequest: {
          body: {
            query: `#graphql
            subscription {
              count
            }
          `,
            extensions: {
              subscription: {
                callback_url: 'http://mock-router-url.com',
                subscription_id: '1234-cats',
                verifier: 'my-verifier-token',
              },
            },
          },
          headers: new HeaderMap([['content-type', 'application/json']]),
          method: 'POST',
          search: '',
        },
        context: async () => ({}),
      });

      expect(result.status).toEqual(500);
      assert(result.body.kind === 'complete');
      expect(JSON.parse(result.body.string)).toMatchInlineSnapshot(`
        {
          "data": null,
          "errors": [
            {
              "message": "\`check\` request failed with unexpected status code: 400, terminating subscription",
            },
          ],
        }
      `);

      // Trigger the heartbeat interval just to make sure it doesn't actually
      // happen in this case (we haven't mocked it, so if it fires it will
      // trigger an error and fail the test).
      jest.advanceTimersByTime(5000);

      await server.stop();

      expect(logger.orderOfOperations).toMatchInlineSnapshot(`
        [
          "SubscriptionCallback[1234-cats]: Received new subscription request",
          "SubscriptionManager[1234-cats]: Sending \`check\` request to router",
          "SubscriptionManager[1234-cats]: \`check\` request failed with unexpected status code: 400, terminating subscription",
          "SubscriptionManager: Terminating subscriptions for IDs: [1234-cats]",
          "ERROR: SubscriptionManager: No subscriptions found for http://mock-router-url.com, skipping termination",
          "ERROR: SubscriptionCallback[1234-cats]: \`check\` request failed: \`check\` request failed with unexpected status code: 400, terminating subscription",
          "SubscriptionCallback: Server is shutting down. Cleaning up outstanding subscriptions and heartbeat intervals",
          "SubscriptionCallback: Successfully cleaned up outstanding subscriptions and heartbeat intervals.",
        ]
      `);
    });

    it('encounters errors on subscription', async () => {
      const server = await startSubscriptionServer({ logger });

      // Mock the initial check response.
      mockRouterCheckResponse();

      const completeRequest = mockRouterCompleteResponse({
        errors: [
          {
            message:
              'The subscription field "invalidSubscriptionField" is not defined.',
            locations: [{ line: 3, column: 15 }],
          },
        ],
      });

      // Trigger an invalid subscription
      const response = await server.executeHTTPGraphQLRequest({
        httpGraphQLRequest: {
          body: {
            query: `#graphql
            subscription {
              invalidSubscriptionField
            }
          `,
            extensions: {
              subscription: {
                callback_url: 'http://mock-router-url.com',
                subscription_id: '1234-cats',
                verifier: 'my-verifier-token',
              },
            },
          },
          headers: new HeaderMap([['content-type', 'application/json']]),
          method: 'POST',
          search: '',
        },
        context: async () => ({}),
      });
      expect(response.status).toEqual(400);
      assert(response.body.kind === 'complete');
      expect(JSON.parse(response.body.string)).toEqual({
        errors: [
          {
            message:
              'Cannot query field "invalidSubscriptionField" on type "Subscription".',
            locations: [{ line: 3, column: 15 }],
            extensions: {
              code: 'GRAPHQL_VALIDATION_FAILED',
            },
          },
        ],
      });

      // Trigger the heartbeat interval just to make sure it doesn't actually
      // happen in this case (we haven't mocked it, so it'll throw an error if it
      // sends a heartbeat).
      jest.advanceTimersByTime(5000);

      await completeRequest;
      await server.stop();
      expect(logger.orderOfOperations).toMatchInlineSnapshot(`
        [
          "SubscriptionManager[1234-cats]: Sending \`check\` request to router",
          "SubscriptionManager[1234-cats]: \`check\` request successful",
          "SubscriptionCallback[1234-cats]: Starting graphql-js subscription",
          "ERROR: SubscriptionCallback[1234-cats]: graphql-js subscription unsuccessful: [
        	The subscription field "invalidSubscriptionField" is not defined.
        ]",
          "SubscriptionManager[1234-cats]: Sending \`complete\` request to router with errors",
          "SubscriptionCallback[1234-cats]: Responding to original subscription request",
          "SubscriptionManager[1234-cats]: \`complete\` request successful",
          "SubscriptionCallback: Server is shutting down. Cleaning up outstanding subscriptions and heartbeat intervals",
          "SubscriptionCallback: Successfully cleaned up outstanding subscriptions and heartbeat intervals.",
        ]
      `);
    });

    it('handles failed heartbeats', async () => {
      const server = await startSubscriptionServer({ logger });

      // Mock the initial check response from the router.
      mockRouterCheckResponse();

      // Start the subscription; this triggers the initial check request and
      // starts the heartbeat interval. This simulates an incoming subscription
      // request from the router.
      const result = await server.executeOperation({
        query: `#graphql
          subscription {
            count
          }
        `,
        extensions: {
          subscription: {
            callback_url: 'http://mock-router-url.com',
            subscription_id: '1234-cats',
            verifier: 'my-verifier-token',
          },
        },
      });

      expect(result.http.status).toEqual(200);

      // 5 failures is the limit before the heartbeat is cancelled. We expect to
      // see 5 errors and then a final error indicating the heartbeat was
      // cancelled in the log snapshot below.
      for (let i = 0; i < 5; i++) {
        // mock heartbeat response failure
        nock('http://mock-router-url.com')
          .matchHeader('content-type', 'application/json')
          .post('/', {
            kind: 'subscription',
            action: 'heartbeat',
            id: '1234-cats',
            verifier: 'my-verifier-token',
            ids: ['1234-cats'],
          })
          .replyWithError('network request error');
        // trigger heartbeat
        jest.advanceTimersByTime(5000);
      }

      await server.stop();

      expect(logger.orderOfOperations).toMatchInlineSnapshot(`
        [
          "SubscriptionCallback[1234-cats]: Received new subscription request",
          "SubscriptionManager[1234-cats]: Sending \`check\` request to router",
          "SubscriptionManager[1234-cats]: \`check\` request successful",
          "SubscriptionCallback[1234-cats]: Starting graphql-js subscription",
          "SubscriptionCallback[1234-cats]: graphql-js subscription successful",
          "SubscriptionManager[1234-cats]: Starting new heartbeat interval for http://mock-router-url.com",
          "SubscriptionManager[1234-cats]: Listening to graphql-js subscription",
          "SubscriptionCallback[1234-cats]: Responding to original subscription request",
          "SubscriptionManager: Sending \`heartbeat\` request to http://mock-router-url.com for IDs: [1234-cats]",
          "SubscriptionCallback: Server is shutting down. Cleaning up outstanding subscriptions and heartbeat intervals",
          "ERROR: SubscriptionManager[1234-cats]: Heartbeat request failed (1 consecutive): request to http://mock-router-url.com/ failed, reason: network request error",
          "SubscriptionManager: Sending \`heartbeat\` request to http://mock-router-url.com for IDs: [1234-cats]",
          "ERROR: SubscriptionManager[1234-cats]: Heartbeat request failed (2 consecutive): request to http://mock-router-url.com/ failed, reason: network request error",
          "SubscriptionManager: Sending \`heartbeat\` request to http://mock-router-url.com for IDs: [1234-cats]",
          "ERROR: SubscriptionManager[1234-cats]: Heartbeat request failed (3 consecutive): request to http://mock-router-url.com/ failed, reason: network request error",
          "SubscriptionManager: Sending \`heartbeat\` request to http://mock-router-url.com for IDs: [1234-cats]",
          "ERROR: SubscriptionManager[1234-cats]: Heartbeat request failed (4 consecutive): request to http://mock-router-url.com/ failed, reason: network request error",
          "SubscriptionManager: Sending \`heartbeat\` request to http://mock-router-url.com for IDs: [1234-cats]",
          "ERROR: SubscriptionManager[1234-cats]: Heartbeat request failed (5 consecutive): request to http://mock-router-url.com/ failed, reason: network request error",
          "ERROR: SubscriptionManager[1234-cats]: Heartbeat request failed 5 times, terminating subscriptions and heartbeat interval: request to http://mock-router-url.com/ failed, reason: network request error",
          "SubscriptionManager: Terminating subscriptions for IDs: [1234-cats]",
          "SubscriptionManager: Terminating heartbeat interval, no more subscriptions for http://mock-router-url.com",
          "SubscriptionCallback: Successfully cleaned up outstanding subscriptions and heartbeat intervals.",
        ]
      `);
    });

    it('handles failed heartbeats with unexpected status codes', async () => {
      const server = await startSubscriptionServer({ logger });

      // Mock the initial check response from the router.
      mockRouterCheckResponse();

      // Start the subscription; this triggers the initial check request and
      // starts the heartbeat interval. This simulates an incoming subscription
      // request from the router.
      const result = await server.executeOperation({
        query: `#graphql
          subscription {
            count
          }
        `,
        extensions: {
          subscription: {
            callback_url: 'http://mock-router-url.com',
            subscription_id: '1234-cats',
            verifier: 'my-verifier-token',
          },
        },
      });

      expect(result.http.status).toEqual(200);

      // 5 failures is the limit before the heartbeat is cancelled. We expect to
      // see 5 errors and then a final error indicating the heartbeat was
      // cancelled in the log snapshot below.
      for (let i = 0; i < 5; i++) {
        // mock heartbeat response failure
        nock('http://mock-router-url.com')
          .matchHeader('content-type', 'application/json')
          .post('/', {
            kind: 'subscription',
            action: 'heartbeat',
            id: '1234-cats',
            verifier: 'my-verifier-token',
            ids: ['1234-cats'],
          })
          .reply(500);
        // trigger heartbeat
        jest.advanceTimersByTime(5000);
      }

      await server.stop();

      expect(logger.orderOfOperations).toMatchInlineSnapshot(`
        [
          "SubscriptionCallback[1234-cats]: Received new subscription request",
          "SubscriptionManager[1234-cats]: Sending \`check\` request to router",
          "SubscriptionManager[1234-cats]: \`check\` request successful",
          "SubscriptionCallback[1234-cats]: Starting graphql-js subscription",
          "SubscriptionCallback[1234-cats]: graphql-js subscription successful",
          "SubscriptionManager[1234-cats]: Starting new heartbeat interval for http://mock-router-url.com",
          "SubscriptionManager[1234-cats]: Listening to graphql-js subscription",
          "SubscriptionCallback[1234-cats]: Responding to original subscription request",
          "SubscriptionManager: Sending \`heartbeat\` request to http://mock-router-url.com for IDs: [1234-cats]",
          "SubscriptionCallback: Server is shutting down. Cleaning up outstanding subscriptions and heartbeat intervals",
          "SubscriptionManager: Heartbeat received response for IDs: [1234-cats]",
          "ERROR: SubscriptionManager[1234-cats]: Heartbeat request failed (1 consecutive): Unexpected status code: 500",
          "SubscriptionManager: Sending \`heartbeat\` request to http://mock-router-url.com for IDs: [1234-cats]",
          "SubscriptionManager: Heartbeat received response for IDs: [1234-cats]",
          "ERROR: SubscriptionManager[1234-cats]: Heartbeat request failed (2 consecutive): Unexpected status code: 500",
          "SubscriptionManager: Sending \`heartbeat\` request to http://mock-router-url.com for IDs: [1234-cats]",
          "SubscriptionManager: Heartbeat received response for IDs: [1234-cats]",
          "ERROR: SubscriptionManager[1234-cats]: Heartbeat request failed (3 consecutive): Unexpected status code: 500",
          "SubscriptionManager: Sending \`heartbeat\` request to http://mock-router-url.com for IDs: [1234-cats]",
          "SubscriptionManager: Heartbeat received response for IDs: [1234-cats]",
          "ERROR: SubscriptionManager[1234-cats]: Heartbeat request failed (4 consecutive): Unexpected status code: 500",
          "SubscriptionManager: Sending \`heartbeat\` request to http://mock-router-url.com for IDs: [1234-cats]",
          "SubscriptionManager: Heartbeat received response for IDs: [1234-cats]",
          "ERROR: SubscriptionManager[1234-cats]: Heartbeat request failed (5 consecutive): Unexpected status code: 500",
          "ERROR: SubscriptionManager[1234-cats]: Heartbeat request failed 5 times, terminating subscriptions and heartbeat interval: Unexpected status code: 500",
          "SubscriptionManager: Terminating subscriptions for IDs: [1234-cats]",
          "SubscriptionManager: Terminating heartbeat interval, no more subscriptions for http://mock-router-url.com",
          "SubscriptionCallback: Successfully cleaned up outstanding subscriptions and heartbeat intervals.",
        ]
      `);
    });

    describe('retries', () => {
      it('failed `check` requests', async () => {
        const server = await startSubscriptionServer({ logger });

        // Mock the initial check response from the router. We'll fail a couple
        // first to test the retry logic.
        mockRouterCheckResponseWithError();
        mockRouterCheckResponseWithError();
        mockRouterCheckResponse();

        // Start the subscription; this triggers the initial check request and
        // starts the heartbeat interval. This simulates an incoming subscription
        // request from the router.
        const result = await server.executeOperation({
          query: `#graphql
            subscription {
              count
            }
          `,
          extensions: {
            subscription: {
              callback_url: 'http://mock-router-url.com',
              subscription_id: '1234-cats',
              verifier: 'my-verifier-token',
            },
          },
        });

        expect(result.http.status).toEqual(200);

        // Mock the heartbeat response from the router. We'll trigger it once below
        // after the subscription is initialized to make sure it works.
        const firstHeartbeat = mockRouterHeartbeatResponse();
        // Advance timers to trigger the heartbeat once. This consumes the one
        // heartbeat mock from above.
        jest.advanceTimersByTime(5000);
        await firstHeartbeat;

        // Mock the update from the router, we'll trigger it below
        const update = mockRouterNextResponse({ payload: { count: 1 } });

        // Trigger a couple updates. These send `next` requests to the router.
        logger.debug('TESTING: Triggering first update');
        await server.executeOperation({
          query: `#graphql
            mutation {
              addOne
            }
          `,
        });

        await update;

        // When we shutdown the server, we'll stop listening for subscription
        // updates, await unresolved requests, and send a `complete` request to the
        // router for each active subscription.
        const completeRequest = mockRouterCompleteResponse();

        await server.stop();
        await completeRequest;

        // The heartbeat should be cleaned up at this point. There is no second
        // heartbeat mock, so if it ticks again it'll throw an error.
        jest.advanceTimersByTime(5000);

        expect(logger.orderOfOperations).toMatchInlineSnapshot(`
          [
            "SubscriptionCallback[1234-cats]: Received new subscription request",
            "SubscriptionManager[1234-cats]: Sending \`check\` request to router",
            "WARN: SubscriptionManager[1234-cats]: Retrying \`check\` request (attempt 1) due to error: request to http://mock-router-url.com/ failed, reason: network request error",
            "WARN: SubscriptionManager[1234-cats]: Retrying \`check\` request (attempt 2) due to error: request to http://mock-router-url.com/ failed, reason: network request error",
            "SubscriptionManager[1234-cats]: \`check\` request successful",
            "SubscriptionCallback[1234-cats]: Starting graphql-js subscription",
            "SubscriptionCallback[1234-cats]: graphql-js subscription successful",
            "SubscriptionManager[1234-cats]: Starting new heartbeat interval for http://mock-router-url.com",
            "SubscriptionManager[1234-cats]: Listening to graphql-js subscription",
            "SubscriptionCallback[1234-cats]: Responding to original subscription request",
            "SubscriptionManager: Sending \`heartbeat\` request to http://mock-router-url.com for IDs: [1234-cats]",
            "SubscriptionManager: Heartbeat received response for IDs: [1234-cats]",
            "SubscriptionManager: Heartbeat request successful, IDs: [1234-cats]",
            "TESTING: Triggering first update",
            "SubscriptionManager[1234-cats]: Sending \`next\` request to router",
            "SubscriptionManager[1234-cats]: \`next\` request successful",
            "SubscriptionCallback: Server is shutting down. Cleaning up outstanding subscriptions and heartbeat intervals",
            "SubscriptionManager[1234-cats]: Sending \`complete\` request to router",
            "SubscriptionManager[1234-cats]: \`complete\` request successful",
            "SubscriptionManager: Terminating subscriptions for IDs: [1234-cats]",
            "SubscriptionManager: Terminating heartbeat interval, no more subscriptions for http://mock-router-url.com",
            "SubscriptionCallback: Successfully cleaned up outstanding subscriptions and heartbeat intervals.",
          ]
        `);
      });

      it('failed `next` requests', async () => {
        const server = await startSubscriptionServer({ logger });

        // Mock the initial check response from the router.
        mockRouterCheckResponse();

        // Start the subscription; this triggers the initial check request and
        // starts the heartbeat interval. This simulates an incoming subscription
        // request from the router.
        const result = await server.executeOperation({
          query: `#graphql
          subscription {
            count
          }
        `,
          extensions: {
            subscription: {
              callback_url: 'http://mock-router-url.com',
              subscription_id: '1234-cats',
              verifier: 'my-verifier-token',
            },
          },
        });

        expect(result.http.status).toEqual(200);

        // Mock the heartbeat response from the router. We'll trigger it once below
        // after the subscription is initialized to make sure it works.
        const firstHeartbeat = mockRouterHeartbeatResponse();
        // Advance timers to trigger the heartbeat once. This consumes the one
        // heartbeat mock from above.
        jest.advanceTimersByTime(5000);
        await firstHeartbeat;

        // Next we'll trigger some subscription events. In advance, we'll mock the
        // router responses. These responses will fail the first 3 times and
        // succeed on the 4th. The retry logic is expected to handle this
        // gracefully.
        const updates = Promise.all([
          mockRouterNextResponse({ payload: { count: 1 }, statusCode: 500 }),
          mockRouterNextResponse({ payload: { count: 1 }, statusCode: 500 }),
          mockRouterNextResponse({ payload: { count: 1 }, statusCode: 500 }),
          mockRouterNextResponse({ payload: { count: 1 } }),
          mockRouterNextResponse({ payload: { count: 2 }, statusCode: 500 }),
          mockRouterNextResponse({ payload: { count: 2 }, statusCode: 500 }),
          mockRouterNextResponse({ payload: { count: 2 }, statusCode: 500 }),
          mockRouterNextResponse({ payload: { count: 2 } }),
        ]);

        // Trigger a couple updates. These send `next` requests to the router.
        logger.debug('TESTING: Triggering first update');
        await server.executeOperation({
          query: `#graphql
          mutation {
            addOne
          }
        `,
        });

        logger.debug('TESTING: Triggering second update');
        await server.executeOperation({
          query: `#graphql
          mutation {
            addOne
          }
        `,
        });

        await updates;

        // When we shutdown the server, we'll stop listening for subscription
        // updates, await unresolved requests, and send a `complete` request to the
        // router for each active subscription.
        const completeRequest = mockRouterCompleteResponse();

        await server.stop();
        await completeRequest;

        // The heartbeat should be cleaned up at this point. There is no second
        // heartbeat mock, so if it ticks again it'll throw an error.
        jest.advanceTimersByTime(5000);

        expect(logger.orderOfOperations).toMatchInlineSnapshot(`
          [
            "SubscriptionCallback[1234-cats]: Received new subscription request",
            "SubscriptionManager[1234-cats]: Sending \`check\` request to router",
            "SubscriptionManager[1234-cats]: \`check\` request successful",
            "SubscriptionCallback[1234-cats]: Starting graphql-js subscription",
            "SubscriptionCallback[1234-cats]: graphql-js subscription successful",
            "SubscriptionManager[1234-cats]: Starting new heartbeat interval for http://mock-router-url.com",
            "SubscriptionManager[1234-cats]: Listening to graphql-js subscription",
            "SubscriptionCallback[1234-cats]: Responding to original subscription request",
            "SubscriptionManager: Sending \`heartbeat\` request to http://mock-router-url.com for IDs: [1234-cats]",
            "SubscriptionManager: Heartbeat received response for IDs: [1234-cats]",
            "SubscriptionManager: Heartbeat request successful, IDs: [1234-cats]",
            "TESTING: Triggering first update",
            "SubscriptionManager[1234-cats]: Sending \`next\` request to router",
            "TESTING: Triggering second update",
            "WARN: SubscriptionManager[1234-cats]: Retrying \`next\` request (attempt 1) due to error: \`next\` request failed with unexpected status code: 500",
            "WARN: SubscriptionManager[1234-cats]: Retrying \`next\` request (attempt 2) due to error: \`next\` request failed with unexpected status code: 500",
            "WARN: SubscriptionManager[1234-cats]: Retrying \`next\` request (attempt 3) due to error: \`next\` request failed with unexpected status code: 500",
            "SubscriptionManager[1234-cats]: \`next\` request successful",
            "SubscriptionManager[1234-cats]: Sending \`next\` request to router",
            "WARN: SubscriptionManager[1234-cats]: Retrying \`next\` request (attempt 1) due to error: \`next\` request failed with unexpected status code: 500",
            "WARN: SubscriptionManager[1234-cats]: Retrying \`next\` request (attempt 2) due to error: \`next\` request failed with unexpected status code: 500",
            "WARN: SubscriptionManager[1234-cats]: Retrying \`next\` request (attempt 3) due to error: \`next\` request failed with unexpected status code: 500",
            "SubscriptionManager[1234-cats]: \`next\` request successful",
            "SubscriptionCallback: Server is shutting down. Cleaning up outstanding subscriptions and heartbeat intervals",
            "SubscriptionManager[1234-cats]: Sending \`complete\` request to router",
            "SubscriptionManager[1234-cats]: \`complete\` request successful",
            "SubscriptionManager: Terminating subscriptions for IDs: [1234-cats]",
            "SubscriptionManager: Terminating heartbeat interval, no more subscriptions for http://mock-router-url.com",
            "SubscriptionCallback: Successfully cleaned up outstanding subscriptions and heartbeat intervals.",
          ]
        `);
      });

      it('failed `complete` requests', async () => {
        const server = await startSubscriptionServer({ logger });

        // Mock the initial check response from the router.
        mockRouterCheckResponse();

        // Start the subscription; this triggers the initial check request and
        // starts the heartbeat interval. This simulates an incoming subscription
        // request from the router.
        const result = await server.executeOperation({
          query: `#graphql
            subscription {
              count
            }
          `,
          extensions: {
            subscription: {
              callback_url: 'http://mock-router-url.com',
              subscription_id: '1234-cats',
              verifier: 'my-verifier-token',
            },
          },
        });

        expect(result.http.status).toEqual(200);

        // Mock the heartbeat response from the router. We'll trigger it once below
        // after the subscription is initialized to make sure it works.
        const firstHeartbeat = mockRouterHeartbeatResponse();
        // Advance timers to trigger the heartbeat once. This consumes the one
        // heartbeat mock from above.
        jest.advanceTimersByTime(5000);
        await firstHeartbeat;

        // Mock the response to the upcoming subscription update.
        const update = mockRouterNextResponse({ payload: { count: 1 } });

        // Trigger a couple updates. These send `next` requests to the router.
        logger.debug('TESTING: Triggering first update');
        await server.executeOperation({
          query: `#graphql
            mutation {
              addOne
            }
          `,
        });

        await update;

        // The server will send a `complete` request when it shuts down. Here we
        // test that the retry logic works for sending `complete` requests.
        const completeRetries = Promise.all([
          mockRouterCompleteResponse({ statusCode: 500 }),
          mockRouterCompleteResponse({ statusCode: 500 }),
          mockRouterCompleteResponse(),
        ]);

        await server.stop();
        await completeRetries;

        // The heartbeat should be cleaned up at this point. There is no second
        // heartbeat mock, so if it ticks again it'll throw an error.
        jest.advanceTimersByTime(5000);

        expect(logger.orderOfOperations).toMatchInlineSnapshot(`
          [
            "SubscriptionCallback[1234-cats]: Received new subscription request",
            "SubscriptionManager[1234-cats]: Sending \`check\` request to router",
            "SubscriptionManager[1234-cats]: \`check\` request successful",
            "SubscriptionCallback[1234-cats]: Starting graphql-js subscription",
            "SubscriptionCallback[1234-cats]: graphql-js subscription successful",
            "SubscriptionManager[1234-cats]: Starting new heartbeat interval for http://mock-router-url.com",
            "SubscriptionManager[1234-cats]: Listening to graphql-js subscription",
            "SubscriptionCallback[1234-cats]: Responding to original subscription request",
            "SubscriptionManager: Sending \`heartbeat\` request to http://mock-router-url.com for IDs: [1234-cats]",
            "SubscriptionManager: Heartbeat received response for IDs: [1234-cats]",
            "SubscriptionManager: Heartbeat request successful, IDs: [1234-cats]",
            "TESTING: Triggering first update",
            "SubscriptionManager[1234-cats]: Sending \`next\` request to router",
            "SubscriptionManager[1234-cats]: \`next\` request successful",
            "SubscriptionCallback: Server is shutting down. Cleaning up outstanding subscriptions and heartbeat intervals",
            "SubscriptionManager[1234-cats]: Sending \`complete\` request to router",
            "WARN: SubscriptionManager[1234-cats]: Retrying \`complete\` request (attempt 1) due to error: \`complete\` request failed with unexpected status code: 500",
            "WARN: SubscriptionManager[1234-cats]: Retrying \`complete\` request (attempt 2) due to error: \`complete\` request failed with unexpected status code: 500",
            "SubscriptionManager[1234-cats]: \`complete\` request successful",
            "SubscriptionManager: Terminating subscriptions for IDs: [1234-cats]",
            "SubscriptionManager: Terminating heartbeat interval, no more subscriptions for http://mock-router-url.com",
            "SubscriptionCallback: Successfully cleaned up outstanding subscriptions and heartbeat intervals.",
          ]
        `);
      });

      it('`complete` requests to failure', async () => {
        const server = await startSubscriptionServer({ logger });

        // Mock the initial check response from the router.
        mockRouterCheckResponse();

        // Start the subscription; this triggers the initial check request and
        // starts the heartbeat interval. This simulates an incoming subscription
        // request from the router.
        const result = await server.executeOperation({
          query: `#graphql
            subscription {
              count
            }
          `,
          extensions: {
            subscription: {
              callback_url: 'http://mock-router-url.com',
              subscription_id: '1234-cats',
              verifier: 'my-verifier-token',
            },
          },
        });

        expect(result.http.status).toEqual(200);

        // Mock the heartbeat response from the router. We'll trigger it once below
        // after the subscription is initialized to make sure it works.
        const firstHeartbeat = mockRouterHeartbeatResponse();
        // Advance timers to trigger the heartbeat once. This consumes the one
        // heartbeat mock from above.
        jest.advanceTimersByTime(5000);
        await firstHeartbeat;

        // Mock the response to the upcoming subscription update.
        const update = mockRouterNextResponse({ payload: { count: 1 } });

        // Trigger a couple updates. These send `next` requests to the router.
        logger.debug('TESTING: Triggering first update');
        await server.executeOperation({
          query: `#graphql
            mutation {
              addOne
            }
          `,
        });

        await update;

        // The server will send a `complete` request when it shuts down. Here we
        // test that the server will retry max 5 times and give up.
        const completeRetries = Promise.all([
          mockRouterCompleteResponse({ statusCode: 500 }),
          mockRouterCompleteResponse({ statusCode: 500 }),
          mockRouterCompleteResponse({ statusCode: 500 }),
          mockRouterCompleteResponse({ statusCode: 500 }),
          mockRouterCompleteResponse({ statusCode: 500 }),
        ]);

        await server.stop();
        await completeRetries;

        // The heartbeat should be cleaned up at this point. There is no second
        // heartbeat mock, so if it ticks again it'll throw an error.
        jest.advanceTimersByTime(5000);

        expect(logger.orderOfOperations).toMatchInlineSnapshot(`
          [
            "SubscriptionCallback[1234-cats]: Received new subscription request",
            "SubscriptionManager[1234-cats]: Sending \`check\` request to router",
            "SubscriptionManager[1234-cats]: \`check\` request successful",
            "SubscriptionCallback[1234-cats]: Starting graphql-js subscription",
            "SubscriptionCallback[1234-cats]: graphql-js subscription successful",
            "SubscriptionManager[1234-cats]: Starting new heartbeat interval for http://mock-router-url.com",
            "SubscriptionManager[1234-cats]: Listening to graphql-js subscription",
            "SubscriptionCallback[1234-cats]: Responding to original subscription request",
            "SubscriptionManager: Sending \`heartbeat\` request to http://mock-router-url.com for IDs: [1234-cats]",
            "SubscriptionManager: Heartbeat received response for IDs: [1234-cats]",
            "SubscriptionManager: Heartbeat request successful, IDs: [1234-cats]",
            "TESTING: Triggering first update",
            "SubscriptionManager[1234-cats]: Sending \`next\` request to router",
            "SubscriptionManager[1234-cats]: \`next\` request successful",
            "SubscriptionCallback: Server is shutting down. Cleaning up outstanding subscriptions and heartbeat intervals",
            "SubscriptionManager[1234-cats]: Sending \`complete\` request to router",
            "WARN: SubscriptionManager[1234-cats]: Retrying \`complete\` request (attempt 1) due to error: \`complete\` request failed with unexpected status code: 500",
            "WARN: SubscriptionManager[1234-cats]: Retrying \`complete\` request (attempt 2) due to error: \`complete\` request failed with unexpected status code: 500",
            "WARN: SubscriptionManager[1234-cats]: Retrying \`complete\` request (attempt 3) due to error: \`complete\` request failed with unexpected status code: 500",
            "WARN: SubscriptionManager[1234-cats]: Retrying \`complete\` request (attempt 4) due to error: \`complete\` request failed with unexpected status code: 500",
            "WARN: SubscriptionManager[1234-cats]: Retrying \`complete\` request (attempt 5) due to error: \`complete\` request failed with unexpected status code: 500",
            "ERROR: SubscriptionManager[1234-cats]: \`complete\` request failed: \`complete\` request failed with unexpected status code: 500",
            "SubscriptionManager: Terminating subscriptions for IDs: [1234-cats]",
            "SubscriptionManager: Terminating heartbeat interval, no more subscriptions for http://mock-router-url.com",
            "SubscriptionCallback: Successfully cleaned up outstanding subscriptions and heartbeat intervals.",
          ]
        `);
      });

      it('terminates subscription after max retries `next` requests', async () => {
        const server = await startSubscriptionServer({ logger });

        // Mock the initial check response from the router.
        mockRouterCheckResponse();

        // Start the subscription; this triggers the initial check request and
        // starts the heartbeat interval. This simulates an incoming subscription
        // request from the router.
        const result = await server.executeOperation({
          query: `#graphql
          subscription {
            count
          }
        `,
          extensions: {
            subscription: {
              callback_url: 'http://mock-router-url.com',
              subscription_id: '1234-cats',
              verifier: 'my-verifier-token',
            },
          },
        });

        expect(result.http.status).toEqual(200);

        // Mock the heartbeat response from the router. We'll trigger it once below
        // after the subscription is initialized to make sure it works.
        const firstHeartbeat = mockRouterHeartbeatResponse();
        // Advance timers to trigger the heartbeat once. This consumes the one
        // heartbeat mock from above.
        jest.advanceTimersByTime(5000);
        await firstHeartbeat;

        // 5 failures to hit the retry limit
        const updates = Promise.all(
          [...new Array(5)].map(() =>
            mockRouterNextResponse({
              payload: { count: 1 },
              statusCode: 500,
            }),
          ),
        );

        // Trigger a couple updates. These send `next` requests to the router.
        logger.debug('TESTING: Triggering first update');
        await server.executeOperation({
          query: `#graphql
          mutation {
            addOne
          }
        `,
        });

        // After 5 failures, the plugin will terminate the subscriptions without
        // sending a `complete` request.
        await updates;
        // Jest needs a little help here to finish handling the retry failures
        // and cancel the subscription.
        await new Promise((resolve) => setTimeout(resolve, 100));
        await server.stop();

        // The heartbeat should be cleaned up at this point. There is no second
        // heartbeat mock, so if it ticks again it'll throw an error.
        jest.advanceTimersByTime(5000);

        expect(logger.orderOfOperations).toMatchInlineSnapshot(`
          [
            "SubscriptionCallback[1234-cats]: Received new subscription request",
            "SubscriptionManager[1234-cats]: Sending \`check\` request to router",
            "SubscriptionManager[1234-cats]: \`check\` request successful",
            "SubscriptionCallback[1234-cats]: Starting graphql-js subscription",
            "SubscriptionCallback[1234-cats]: graphql-js subscription successful",
            "SubscriptionManager[1234-cats]: Starting new heartbeat interval for http://mock-router-url.com",
            "SubscriptionManager[1234-cats]: Listening to graphql-js subscription",
            "SubscriptionCallback[1234-cats]: Responding to original subscription request",
            "SubscriptionManager: Sending \`heartbeat\` request to http://mock-router-url.com for IDs: [1234-cats]",
            "SubscriptionManager: Heartbeat received response for IDs: [1234-cats]",
            "SubscriptionManager: Heartbeat request successful, IDs: [1234-cats]",
            "TESTING: Triggering first update",
            "SubscriptionManager[1234-cats]: Sending \`next\` request to router",
            "WARN: SubscriptionManager[1234-cats]: Retrying \`next\` request (attempt 1) due to error: \`next\` request failed with unexpected status code: 500",
            "WARN: SubscriptionManager[1234-cats]: Retrying \`next\` request (attempt 2) due to error: \`next\` request failed with unexpected status code: 500",
            "WARN: SubscriptionManager[1234-cats]: Retrying \`next\` request (attempt 3) due to error: \`next\` request failed with unexpected status code: 500",
            "WARN: SubscriptionManager[1234-cats]: Retrying \`next\` request (attempt 4) due to error: \`next\` request failed with unexpected status code: 500",
            "WARN: SubscriptionManager[1234-cats]: Retrying \`next\` request (attempt 5) due to error: \`next\` request failed with unexpected status code: 500",
            "ERROR: SubscriptionManager[1234-cats]: \`next\` request failed, terminating subscription: \`next\` request failed with unexpected status code: 500",
            "SubscriptionManager: Terminating subscriptions for IDs: [1234-cats]",
            "SubscriptionManager: Terminating heartbeat interval, no more subscriptions for http://mock-router-url.com",
            "SubscriptionCallback: Server is shutting down. Cleaning up outstanding subscriptions and heartbeat intervals",
            "SubscriptionCallback: Successfully cleaned up outstanding subscriptions and heartbeat intervals.",
          ]
        `);
      });
    });
  });
});

async function startSubscriptionServer(
  opts?: Partial<ApolloServerOptionsWithTypeDefs<BaseContext>>,
) {
  let count = 0;
  const pubsub = new PubSub();
  const server = new ApolloServer({
    plugins: [
      ApolloServerPluginSubscriptionCallback({
        // set some reasonable testing defaults
        retry: {
          maxTimeout: 50,
          minTimeout: 10,
        },
        ...(opts?.logger ? { logger: opts.logger } : undefined),
      }),
    ],
    typeDefs: `#graphql
      type Query {
        hello: String!
      }
      type Mutation {
        addOne: Boolean!
      }
      type Subscription {
        count: Int
        terminatesSuccessfully: Boolean
      }
    `,
    resolvers: {
      Query: {
        hello: () => 'world',
      },
      Mutation: {
        addOne: async () => {
          await pubsub.publish('ADD_ONE', { count: ++count });
          return true;
        },
      },
      Subscription: {
        count: {
          subscribe: () => pubsub.asyncIterator(['ADD_ONE']),
        },
        terminatesSuccessfully: {
          subscribe: () => ({
            count: 0,
            [Symbol.asyncIterator]() {
              return {
                next: () => {
                  this.count++;
                  return {
                    value: { terminatesSuccessfully: true },
                    done: this.count > 1,
                  };
                },
              };
            },
          }),
        },
      },
    },
    ...opts,
  });
  await server.start();
  return server;
}

// Other attempts at this which didn't actually solve the problem::
// * Use `nock`'s reply callback to resolve a promise. At that point the reply
//   isn't done yet, so it's insufficient.
// * while (!nock.isDone()) { await new Promise(...) } - isDone is true when the
//   mock is consumed and before the reply is done, so also insufficient.
function promisifyNock(nock: nock.Scope) {
  return new Promise<void>((resolve) => {
    nock.addListener('replied', () => {
      resolve();
    });
  });
}

function mockRouterCheckResponse(opts?: {
  requestOpts?: {
    url?: string;
    id?: string;
    verifier?: string;
  };
  statusCode?: number;
  responseBody?: any;
}) {
  const {
    requestOpts: {
      url = 'http://mock-router-url.com',
      id = '1234-cats',
      verifier = 'my-verifier-token',
    } = {},
    statusCode = 204,
    responseBody = undefined,
  } = opts ?? {};

  return promisifyNock(
    nock(url)
      .matchHeader('content-type', 'application/json')
      .post('/', {
        kind: 'subscription',
        action: 'check',
        id,
        verifier,
      })
      .reply(statusCode, responseBody),
  );
}

function mockRouterCheckResponseWithError(opts?: {
  requestOpts?: {
    url?: string;
    id?: string;
    verifier?: string;
  };
}) {
  const {
    requestOpts: {
      url = 'http://mock-router-url.com',
      id = '1234-cats',
      verifier = 'my-verifier-token',
    } = {},
  } = opts ?? {};

  return promisifyNock(
    nock(url)
      .matchHeader('content-type', 'application/json')
      .post('/', {
        kind: 'subscription',
        action: 'check',
        id,
        verifier,
      })
      .replyWithError('network request error'),
  );
}

function mockRouterHeartbeatResponse(opts?: {
  requestOptions: {
    url?: string;
    id?: string;
    verifier?: string;
    ids?: string[];
    invalidIds?: string[];
  };
  statusCode?: number;
  responseBody?: any;
}) {
  const {
    requestOptions: {
      url = 'http://mock-router-url.com',
      id = '1234-cats',
      verifier = 'my-verifier-token',
      ids = undefined,
      invalidIds = undefined,
    } = {},
    statusCode = 200,
    responseBody,
  } = opts ?? {};

  return promisifyNock(
    nock(url)
      .matchHeader('content-type', 'application/json')
      .post('/', {
        kind: 'subscription',
        action: 'heartbeat',
        id,
        verifier,
        ids: ids ?? [id],
        ...(invalidIds && { invalid_ids: invalidIds }),
      })
      .reply(statusCode, responseBody),
  );
}

function mockRouterNextResponse(requestOpts: {
  payload: Record<string, any>;
  url?: string;
  id?: string;
  verifier?: string;
  statusCode?: number;
}) {
  const {
    payload,
    url = 'http://mock-router-url.com',
    id = '1234-cats',
    verifier = 'my-verifier-token',
    statusCode = 200,
  } = requestOpts;

  return promisifyNock(
    nock(url)
      .matchHeader('content-type', 'application/json')
      .post('/', {
        kind: 'subscription',
        action: 'next',
        id,
        verifier,
        payload: { data: payload },
      })
      .reply(statusCode),
  );
}

function mockRouterCompleteResponse(requestOpts?: {
  errors?: any[];
  url?: string;
  id?: string;
  verifier?: string;
  statusCode?: number;
}) {
  const {
    errors = undefined,
    url = 'http://mock-router-url.com',
    id = '1234-cats',
    verifier = 'my-verifier-token',
    statusCode = 200,
  } = requestOpts ?? {};

  return promisifyNock(
    nock(url)
      .matchHeader('content-type', 'application/json')
      .post('/', {
        kind: 'subscription',
        action: 'complete',
        id,
        verifier,
        ...(errors && { errors }),
      })
      .reply(statusCode),
  );
}

/**
 * Returns a logger that pushes all logs to an array. This is used validate the
 * order in which things happen within the plugin at the end of a test.
 */
function orderOfOperationsLogger() {
  const logger: Logger & { orderOfOperations: string[] } = {
    debug(msg: string) {
      this.orderOfOperations.push(msg);
    },
    info() {},
    warn(msg: string) {
      this.orderOfOperations.push(`WARN: ${msg}`);
    },
    error(msg: string) {
      this.orderOfOperations.push(`ERROR: ${msg}`);
    },
    orderOfOperations: [],
  };
  return logger;
}
