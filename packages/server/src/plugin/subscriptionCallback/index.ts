import type { Logger } from '@apollo/utils.logger';
import { GraphQLError, subscribe, type ExecutionResult } from 'graphql';
import fetch, { type Response } from 'node-fetch';
import { ensureGraphQLError } from '../../errorNormalize.js';
import type { ApolloServerPlugin } from '../../externalTypes/index.js';
import { internalPlugin } from '../../internalPlugin.js';
import { HeaderMap } from '../../utils/HeaderMap.js';

export interface ApolloServerPluginSubscriptionCallbackOptions {
  heartbeatIntervalMs?: number;
  logger?: Logger;
}

export function ApolloServerPluginSubscriptionCallback(
  options: ApolloServerPluginSubscriptionCallbackOptions = Object.create(null),
): ApolloServerPlugin {
  const subscriptionManager = new SubscriptionManager(options);
  const logger = options.logger
    ? prefixedLogger(options.logger, 'SubscriptionCallback')
    : undefined;

  return internalPlugin({
    __internal_plugin_id__: 'SubscriptionCallback',
    __is_disabled_plugin__: false,
    async requestDidStart({ request }) {
      // If it's not a callback subscription, ignore the request.
      if (!request?.extensions?.subscription) return;

      return {
        // Implementing `responseForOperation` is the only hook that allows us
        // to bypass normal execution by returning our own response. We don't
        // want Apollo Server to actually handle this subscription request, we
        // want to handle everything ourselves. The actual subscription handling
        // will be done in `willSendResponse`. The router expects the initial
        // response to be a 200, with the `subscription-protocol` header set to
        // `callback`.
        async responseForOperation({ request }) {
          logger?.debug(
            'Received new subscription request',
            request.extensions!.subscription.subscription_id,
          );

          return {
            http: {
              status: 200,
              headers: new HeaderMap([['subscription-protocol', 'callback']]),
            },
            body: {
              kind: 'single',
              singleResult: {},
            },
          };
        },
        // The majority of the subscription work is implemented in this hook.
        // This can _almost_ all be implemented in `responseForOperation`,
        // however in the case of GraphQL validation errors,
        // `responseForOperation` won't actually be called, but
        // `willSendResponse` will.
        async willSendResponse({
          request,
          schema,
          document,
          contextValue,
          operationName,
          response,
        }) {
          const {
            callback_url: callbackUrl,
            subscription_id: id,
            verifier,
          } = request.extensions!.subscription;
          try {
            logger?.debug(
              'Sending `check` request to router',
              request.extensions!.subscription.subscription_id,
            );
            // Before responding to the original request, we need to complete a
            // roundtrip `check` request to the router, so we `await` this
            // request.
            await subscriptionManager.checkRequest({
              callbackUrl,
              id,
              verifier,
            });
            logger?.debug(
              '`check` request successful',
              request.extensions!.subscription.subscription_id,
            );
          } catch (e) {
            const graphqlError = ensureGraphQLError(e);
            logger?.error(
              `\`check\` request failed: ${graphqlError.message}`,
              id,
            );
            // In the event of a check failure, we respond to the original
            // request with a >=400 status code.
            if (response.body.kind === 'single') {
              response.body.singleResult.errors = [graphqlError];
              response.http.status = 400;
            }
            return;
          }

          // The `check` request was successful, so we can initialize the actual
          // `graphql-js` subscription. We don't expect `subscribe` to throw,
          // but rather return an object with `errors` on it (if there are any).
          logger?.debug(`Starting graphql-js subscription`, id);
          let subscription: Awaited<ReturnType<typeof subscribe>>;
          try {
            subscription = await subscribe({
              schema,
              document: document!,
              variableValues: request.variables,
              contextValue: contextValue,
              operationName: operationName,
            });
          } catch (e) {
            // While we don't expect this scenario, we should still handle it
            // gracefully (in the same way that we do below, when the
            // subscription object has `errors` on it).
            const graphqlError = ensureGraphQLError(e);
            logger?.error(
              `Programming error: graphql-js subscribe() threw unexpectedly! Please report this bug to Apollo. The error was: ${e}`,
              id,
            );
            subscriptionManager.completeRequest({
              errors: [graphqlError],
              callbackUrl: request?.extensions?.subscription?.callback_url,
              id: request.extensions?.subscription?.subscription_id,
              verifier: request.extensions?.subscription?.verifier,
            });
          }

          // In the case of errors, send a `complete` request to the router with
          // the errors.
          if ('errors' in subscription!) {
            logger?.error(
              `graphql-js subscription unsuccessful: [\n\t${subscription.errors
                ?.map((e) => e.message)
                .join(',\n\t')}\n]`,
              id,
            );

            try {
              subscriptionManager.completeRequest({
                errors: subscription.errors,
                callbackUrl: request?.extensions?.subscription?.callback_url,
                id: request.extensions?.subscription?.subscription_id,
                verifier: request.extensions?.subscription?.verifier,
              });
            } catch (e) {
              // TODO: not sure how to best handle a failed "completion with
              // errors" request outside of retrying.
              logger?.error(`\`complete\` request failed: ${e}`, id);
            }
          } else if (isAsyncIterable(subscription!)) {
            // We have a real subscription - now we can kick off the heartbeat
            // interval and consume the AsyncIterable on the `subscription`
            // object.
            logger?.debug('graphql-js subscription successful', id);
            subscriptionManager.initHeartbeat({
              callbackUrl: request?.extensions?.subscription?.callback_url,
              id: request.extensions?.subscription?.subscription_id,
              verifier: request.extensions?.subscription?.verifier,
            });

            subscriptionManager.startConsumingSubscription({
              subscription,
              callbackUrl: request?.extensions?.subscription?.callback_url,
              id: request.extensions?.subscription?.subscription_id,
              verifier: request.extensions?.subscription?.verifier,
            });
          }

          logger?.debug(`Responding to original subscription request`, id);
        },
      };
    },
    async serverWillStart() {
      return {
        async drainServer() {
          logger?.debug(
            'Server is shutting down. Cleaning up outstanding subscriptions and heartbeat intervals',
          );
          await subscriptionManager.cleanup();
          logger?.debug(
            'Successfully cleaned up outstanding subscriptions and heartbeat intervals.',
          );
        },
      };
    },
  });
}

function isAsyncIterable<T>(value: any): value is AsyncIterable<T> {
  return value && typeof value[Symbol.asyncIterator] === 'function';
}

interface SubscriptionObject {
  cancelled: boolean;
  startConsumingSubscription: () => Promise<void>;
  completeSubscription: () => Promise<void>;
}
// This class manages the state of subscriptions, heartbeat intervals, and
// router requests. It keeps track of in flight requests so we can await them
// during server cleanup.
class SubscriptionManager {
  private heartbeatIntervalMs: number;
  private logger?: ReturnType<typeof prefixedLogger>;
  private requestsInFlight: Set<Promise<any>> = new Set();
  // A map of information about subscriptions for a given callback url. For each
  // url, this tracks its single heartbeat interval (with relevant heartbeat
  // request info) and active subscriptions.
  private subscriptionInfoByCallbackUrl: Map<
    string,
    {
      heartbeat?: {
        id: string;
        verifier: string;
        interval: NodeJS.Timeout;
        queue: Promise<void>[];
      };
      subscriptionsById: Map<string, SubscriptionObject>;
    }
  > = new Map();

  constructor(opts: {
    heartbeatIntervalMs?: number;
    logger?: ReturnType<typeof prefixedLogger>;
  }) {
    this.heartbeatIntervalMs = opts.heartbeatIntervalMs ?? 5000;
    this.logger = opts.logger
      ? prefixedLogger(opts.logger, 'SubscriptionManager')
      : undefined;
  }

  // Implements sending the `check` request to the router. Fetch errors are
  // thrown and expected to be handled by the caller. Additionally throws if the
  // router doesn't respond with a 204.
  async checkRequest({
    callbackUrl,
    id,
    verifier,
  }: {
    callbackUrl: string;
    id: string;
    verifier: string;
  }) {
    let checkResponse: Promise<Response>;
    try {
      checkResponse = fetch(callbackUrl, {
        method: 'POST',
        body: JSON.stringify({
          kind: 'subscription',
          action: 'check',
          id,
          verifier,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      this.requestsInFlight.add(checkResponse);
      await checkResponse;
    } finally {
      this.requestsInFlight.delete(checkResponse!);
    }

    if ((await checkResponse).status !== 204) {
      throw new GraphQLError('Failed to initialize subscription', {
        extensions: {
          code: 'SUBSCRIPTION_INIT_FAILED',
        },
      });
    }
  }

  // Kicks off an interval that sends `heartbeat` requests to the router. If an
  // interval already exists for the callback url, we just add the new ID to its
  // list of IDs that it's sending a heartbeat for. This allows us to send one
  // batched heartbeat per interval per callback url.
  initHeartbeat({
    callbackUrl,
    id,
    verifier,
  }: {
    callbackUrl: string;
    id: string;
    verifier: string;
  }) {
    if (!this.subscriptionInfoByCallbackUrl.has(callbackUrl)) {
      this.subscriptionInfoByCallbackUrl.set(callbackUrl, {
        subscriptionsById: new Map(),
      });
    }

    // Skip interval creation if one already exists for this url
    if (this.subscriptionInfoByCallbackUrl.get(callbackUrl)?.heartbeat) {
      this.logger?.debug(
        `Heartbeat interval already exists for ${callbackUrl}, reusing existing interval`,
        id,
      );
      return;
    }

    // Kickoff heartbeat interval since there isn't one already
    this.logger?.debug(
      `Starting new heartbeat interval for ${callbackUrl}`,
      id,
    );
    const heartbeatInterval = setInterval(async () => {
      let heartbeatRequest: Promise<Response> | undefined;

      // FIXME: since we're on an interval, it's possible a heartbeat goes out
      // before the previous heartbeat has finished. It seems reasonable to
      // queue them and await the previous heartbeat if there is one. It might
      // also be reasonable to just bail / skip this heartbeat if there's
      // already one in flight. I'm not sure which is better. This Promise and
      // all of the queue stuff try to address this. Maybe this would be better
      // off chaining timeouts instead of using an interval?
      let resolveHeartbeatPromise: () => void;
      const heartbeatPromise = new Promise<void>((r) => {
        resolveHeartbeatPromise = r;
      });
      const existingHeartbeat =
        this.subscriptionInfoByCallbackUrl.get(callbackUrl)?.heartbeat;
      if (!existingHeartbeat) {
        // FIXME: we can bail cleanly and log probably
        throw new Error(
          `Programming error: Heartbeat interval unexpectedly missing for ${callbackUrl}`,
        );
      }
      const { queue } = existingHeartbeat;
      queue.push(heartbeatPromise);
      if (queue.length > 1) {
        const requestBeforeMe = queue[existingHeartbeat?.queue.length - 2];
        await requestBeforeMe;
      }

      // Send the heartbeat request
      try {
        const ids = Array.from(
          this.subscriptionInfoByCallbackUrl
            .get(callbackUrl)
            ?.subscriptionsById.keys() ?? [],
        );
        this.logger?.debug(
          `Sending \`heartbeat\` request to ${callbackUrl} for IDs: [${ids.join(
            ',',
          )}]`,
        );

        heartbeatRequest = fetch(callbackUrl, {
          method: 'POST',
          body: JSON.stringify({
            kind: 'subscription',
            action: 'heartbeat',
            id: existingHeartbeat?.id ?? id,
            verifier: existingHeartbeat?.verifier ?? verifier,
            ids,
          }),
          headers: { 'Content-Type': 'application/json' },
        });
        this.requestsInFlight.add(heartbeatRequest);

        // The heartbeat response might contain updates for us to act upon, so we
        // need to await it
        const result = await heartbeatRequest;

        this.logger?.debug(
          `Heartbeat request successful for IDs: [${ids.join(',')}]`,
        );

        if (result.status === 400) {
          const body = await result.json();
          this.logger?.debug(
            `Heartbeat request received invalid IDs: [${body.invalid_ids.join(
              ',',
            )}]`,
          );
          // Some of the IDs are invalid, so we need to update the id and
          // verifier for future heartbeat requests (both provided by the router
          // in the response body)
          existingHeartbeat.id = body.id;
          existingHeartbeat.verifier = body.verifier;

          this.terminateSubscriptions(body.invalid_ids, callbackUrl);
        } else if (result.status === 404) {
          // all ids we sent are invalid
          this.logger?.debug(
            `Heartbeat request received invalid IDs: [${ids.join(',')}]`,
          );
          // This will also handle cleaning up the heartbeat interval
          this.terminateSubscriptions(ids, callbackUrl);
        }
      } catch (e) {
        // FIXME: handle this error
        this.logger?.error(
          `Heartbeat request failed: ${e}`,
          existingHeartbeat.id,
        );
        throw e;
      } finally {
        if (heartbeatRequest) {
          this.requestsInFlight.delete(heartbeatRequest);
        }
        // remove itself from the queue and resolve the promise
        existingHeartbeat?.queue.shift();
        resolveHeartbeatPromise!();
      }
    }, this.heartbeatIntervalMs);

    // Add the heartbeat interval to the map of intervals
    const subscriptionInfo =
      this.subscriptionInfoByCallbackUrl.get(callbackUrl)!;
    subscriptionInfo.heartbeat = {
      interval: heartbeatInterval,
      id,
      verifier,
      queue: [],
    };
  }

  // Cancels and cleans up the subscriptions for given IDs and callback url. If
  // there are no active subscriptions after this, we also clean up the
  // heartbeat interval. This does not handle sending the `complete` request to
  // the router.
  private terminateSubscriptions(ids: string[], callbackUrl: string) {
    this.logger?.debug(`Terminating subscriptions for IDs: [${ids.join(',')}]`);
    const subscriptionInfo =
      this.subscriptionInfoByCallbackUrl.get(callbackUrl);
    if (!subscriptionInfo) {
      this.logger?.error(
        `No subscriptions found for ${callbackUrl}, skipping termination`,
      );
      return;
    }
    const { subscriptionsById, heartbeat } = subscriptionInfo;
    for (const id of ids) {
      const subscription = subscriptionsById.get(id);
      if (subscription) {
        subscription.cancelled = true;
      }
      subscriptionsById.delete(id);
      // if the list is empty now we can clean up everything for this callback url
      if (subscriptionsById?.size === 0) {
        this.logger?.debug(
          `Terminating heartbeat interval, no more subscriptions for ${callbackUrl}`,
        );
        if (heartbeat) clearInterval(heartbeat.interval);
        this.subscriptionInfoByCallbackUrl.delete(callbackUrl);
      }
    }
  }

  // Consumes the AsyncIterable returned by `graphql-js`'s `subscribe` function.
  // This handles sending the `next` requests to the router as well as the
  // `complete` request when the subscription is finished.
  startConsumingSubscription({
    subscription,
    callbackUrl,
    id,
    verifier,
  }: {
    subscription: AsyncGenerator<ExecutionResult, void, void>;
    callbackUrl: string;
    id: string;
    verifier: string;
  }) {
    // For each subscription we need to manage a bit of state. We need to be
    // able to cancel the subscription externally. Setting `cancelled` to true
    // allows us to break out of the `for await` and ignore future payloads.
    const self = this;
    const subscriptionObject = {
      cancelled: false,
      async startConsumingSubscription() {
        self.logger?.debug(`Listening to graphql-js subscription`, id);
        for await (const payload of subscription) {
          // If there's an existing heartbeat request in flight, wait for it to
          // finish before sending an update. It's possible this subscription
          // will be cancelled during the heartbeat request. This does mean that
          // all updates "wait" while there's an active heartbeat in flight.
          const existingHeartbeat =
            self.subscriptionInfoByCallbackUrl.get(callbackUrl)?.heartbeat;
          if (existingHeartbeat && existingHeartbeat.queue.length > 0) {
            await existingHeartbeat.queue[existingHeartbeat.queue.length - 1];
          }
          if (this.cancelled) {
            self.logger?.debug(
              `Subscription already cancelled, ignoring current and future payloads`,
              id,
            );
            // It's already been cancelled - something else has already handled
            // sending the `complete` request so we don't want to `break` here
            // and send it again after the loop.
            return;
          }

          let updateRequest: Promise<Response> | undefined;
          try {
            self.logger?.debug(
              'Sending `next` request to router with subscription update',
              id,
            );
            updateRequest = fetch(callbackUrl, {
              method: 'POST',
              body: JSON.stringify({
                kind: 'subscription',
                action: 'next',
                id,
                verifier,
                payload,
              }),
              headers: { 'Content-Type': 'application/json' },
            });
            self.requestsInFlight.add(updateRequest);
            await updateRequest;
            self.logger?.debug('`next` request successful', id);
          } catch (e) {
            self.logger?.error(`\`next\` request failed: ${e}`, id);
            // TODO: handle this error (terminate subscription / retry?)
            throw e;
          } finally {
            self.requestsInFlight.delete(updateRequest!);
          }
        }
        // The subscription ended without errors, send the `complete` request to
        // the router
        self.logger?.debug(`Subscription completed without errors`, id);
        await this.completeSubscription();
      },
      async completeSubscription() {
        if (this.cancelled) return;
        this.cancelled = true;

        let completeRequestPromise: Promise<void>;
        try {
          completeRequestPromise = self.completeRequest({
            callbackUrl,
            id,
            verifier,
          });
          self.requestsInFlight.add(completeRequestPromise);
          await completeRequestPromise;
        } catch (e) {
          // This is just the `complete` request. If something fails here, we
          // can still proceed as usual and cleanup the subscription. The router
          // should just terminate the subscription on its end when it doesn't
          // receive a heartbeat for it.
          self.logger?.error(`\`complete\` request failed: ${e}`, id);
        } finally {
          self.requestsInFlight.delete(completeRequestPromise!);
          // clean up the subscription (and heartbeat if necessary)
          self.terminateSubscriptions([id], callbackUrl);
        }
      },
    };

    subscriptionObject.startConsumingSubscription();
    const subscriptionInfo =
      this.subscriptionInfoByCallbackUrl.get(callbackUrl);
    if (!subscriptionInfo) {
      this.logger?.error(
        `No existing heartbeat found for ${callbackUrl}, skipping subscription`,
      );
    }
    subscriptionInfo?.subscriptionsById.set(id, subscriptionObject);
  }

  // Sends the `complete` request to the router.
  async completeRequest({
    errors,
    callbackUrl,
    id,
    verifier,
  }: {
    errors?: readonly GraphQLError[];
    callbackUrl: string;
    id: string;
    verifier: string;
  }) {
    let completeRequest: Promise<Response> | undefined;
    try {
      const maybeWithErrors = errors?.length ? ` with errors` : '';
      this.logger?.debug(
        'Sending `complete` request to router' + maybeWithErrors,
        id,
      );
      const completeRequest = fetch(callbackUrl, {
        method: 'POST',
        body: JSON.stringify({
          kind: 'subscription',
          action: 'complete',
          id,
          verifier,
          ...(errors && { errors }),
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      this.requestsInFlight.add(completeRequest);
      await completeRequest;
      this.logger?.debug('`complete` request successful', id);
    } catch (e) {
      this.logger?.error(`\`complete\` request failed: ${e}`, id);
      // TODO: handle this error
      throw e;
    } finally {
      this.requestsInFlight.delete(completeRequest!);
    }
  }

  collectAllSubscriptions() {
    return Array.from(this.subscriptionInfoByCallbackUrl.values()).reduce(
      (subscriptions, { subscriptionsById }) => {
        subscriptions.push(...Array.from(subscriptionsById.values()));
        return subscriptions;
      },
      [] as SubscriptionObject[],
    );
  }

  async cleanup() {
    // Wait for our inflight heartbeats to finish - they might handle cancelling
    // some subscriptions
    await Promise.all(
      Array.from(this.subscriptionInfoByCallbackUrl.values()).map(
        async ({ heartbeat }) => {
          clearInterval(heartbeat?.interval);
          await heartbeat?.queue[heartbeat.queue.length - 1];
        },
      ),
    );
    // Cancel / complete any still-active subscriptions
    await Promise.all(
      this.collectAllSubscriptions()
        .filter((s) => !s.cancelled)
        .map((s) => s.completeSubscription()),
    );
    // Wait for any remaining requests to finish
    await Promise.all(this.requestsInFlight.values());
  }
}

// Simple prefixing logger to curry class name and request IDs into log messages
function prefixedLogger(logger: Logger, prefix: string) {
  function log(level: keyof Logger) {
    return function (message: string, id?: string) {
      logger[level](`${prefix}${id ? `[${id}]` : ''}: ${message}`);
    };
  }
  return {
    debug: log('debug'),
    error: log('error'),
    info: log('info'),
    warn: log('warn'),
  };
}
