import { type FetcherResponse, type Fetcher } from '@apollo/utils.fetcher';
import type { Logger } from '@apollo/utils.logger';
import retry from 'async-retry';
import { subscribe, type ExecutionResult, type GraphQLError } from 'graphql';
import { setImmediate } from 'node:timers/promises';
import { ensureError, ensureGraphQLError } from '../../errorNormalize.js';
import type { ApolloServerPlugin } from '../../externalTypes/index.js';
import { HeaderMap } from '../../utils/HeaderMap.js';

export interface ApolloServerPluginSubscriptionCallbackOptions {
  maxConsecutiveHeartbeatFailures?: number;
  logger?: Logger;
  retry?: retry.Options;
  /**
   * Specifies which Fetch API implementation to use for the callback URL.
   */
  fetcher?: Fetcher;
}

export function ApolloServerPluginSubscriptionCallback(
  options: ApolloServerPluginSubscriptionCallbackOptions = Object.create(null),
): ApolloServerPlugin {
  const subscriptionManager = new SubscriptionManager(options);
  const logger = options.logger
    ? prefixedLogger(options.logger, 'SubscriptionCallback')
    : undefined;

  return {
    async requestDidStart({ request }) {
      const subscriptionExtension = request?.extensions?.subscription;
      // If it's not a callback subscription, ignore the request.
      if (!subscriptionExtension) return;
      let {
        callbackUrl,
        subscriptionId: id,
        verifier,
        heartbeatIntervalMs,
      } = subscriptionExtension;
      // The GA version of callback protocol use camelCase, this is to keep backward compatibility
      callbackUrl = callbackUrl || subscriptionExtension.callback_url;
      id = id || subscriptionExtension.subscription_id;
      heartbeatIntervalMs =
        heartbeatIntervalMs ??
        subscriptionExtension.heartbeat_interval_ms ??
        5000;

      return {
        // Implementing `responseForOperation` is the only hook that allows us
        // to bypass normal execution by returning our own response. We don't
        // want Apollo Server to actually handle this subscription request, we
        // want to handle everything ourselves. The actual subscription handling
        // will be done in `willSendResponse`.
        async responseForOperation() {
          logger?.debug('Received new subscription request', id);

          return {
            http: {
              status: 200,
              headers: new HeaderMap([['content-type', 'application/json']]),
            },
            body: {
              kind: 'single',
              singleResult: {
                data: null,
              },
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
          try {
            // Before responding to the original request, we need to complete a
            // roundtrip `check` request to the router, so we `await` this
            // request.
            await subscriptionManager.checkRequest({
              callbackUrl,
              id,
              verifier,
            });
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
              response.http.status = 500;
            }
            return;
          }

          // We're about to `await` the subscription, which could have some
          // nontrivial asynchronous work to do before returning the generator.
          // We set up the heartbeat first so the router knows we're alive
          // during that wait period.
          subscriptionManager.initHeartbeat({
            callbackUrl,
            id,
            verifier,
            heartbeatIntervalMs,
          });

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
              callbackUrl,
              id,
              verifier,
            });
            return;
          }

          // In the case of errors, send a `complete` request to the router with
          // the errors.
          if ('errors' in subscription) {
            logger?.error(
              `graphql-js subscription unsuccessful: [\n\t${subscription.errors
                ?.map((e) => e.message)
                .join(',\n\t')}\n]`,
              id,
            );

            try {
              subscriptionManager.completeRequest({
                errors: subscription.errors,
                callbackUrl,
                id,
                verifier,
              });
            } catch (e) {
              // TODO: not sure how to best handle a failed "completion with
              // errors" request outside of retrying.
              logger?.error(`\`complete\` request failed: ${e}`, id);
            }
          } else if (isAsyncIterable(subscription)) {
            // We have a real subscription - now we can consume the
            // AsyncIterable on the `subscription` object.
            logger?.debug('graphql-js subscription successful', id);

            subscriptionManager.startConsumingSubscription({
              subscription,
              callbackUrl,
              id,
              verifier,
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
          // This setImmediate makes the precise timing of the log line below
          // consistent between when we run our test suite with GraphQL.js v16
          // and v17.0.0-alpha.9.
          await setImmediate();
          logger?.debug(
            'Successfully cleaned up outstanding subscriptions and heartbeat intervals.',
          );
        },
      };
    },
  };
}

function isAsyncIterable<T>(value: any): value is AsyncIterable<T> {
  return value && typeof value[Symbol.asyncIterator] === 'function';
}

interface SubscriptionObject {
  cancelled: boolean;
  asyncIter: AsyncGenerator<ExecutionResult, void, void>;
  startConsumingSubscription: () => Promise<void>;
  completeSubscription: () => Promise<void>;
}
// This class manages the state of subscriptions, heartbeat intervals, and
// router requests. It keeps track of in flight requests so we can await them
// during server cleanup.
class SubscriptionManager {
  private maxConsecutiveHeartbeatFailures: number;
  private logger?: ReturnType<typeof prefixedLogger>;
  private retryConfig?: retry.Options;
  private requestsInFlight: Set<Promise<any>> = new Set();
  // A map of information about subscription for a given callback url including the subscription id.
  private subscriptionInfoByCallbackUrl: Map<
    string,
    {
      heartbeat?: {
        id: string;
        verifier: string;
        interval: NodeJS.Timeout;
        queue: Promise<void>[];
      };
      subscription?: SubscriptionObject;
    }
  > = new Map();
  private fetcher: Fetcher;

  constructor(options: ApolloServerPluginSubscriptionCallbackOptions) {
    this.maxConsecutiveHeartbeatFailures =
      options.maxConsecutiveHeartbeatFailures ?? 5;
    this.retryConfig = {
      retries: 5,
      minTimeout: 100,
      maxTimeout: 1000,
      ...options.retry,
    };
    this.logger = options.logger
      ? prefixedLogger(options.logger, 'SubscriptionManager')
      : undefined;
    this.fetcher = options.fetcher ?? fetch;
  }

  async retryFetch({
    url,
    action,
    id,
    verifier,
    payload,
    errors,
    headers,
  }: {
    url: string;
    action: 'check' | 'next' | 'complete';
    id: string;
    verifier: string;
    payload?: ExecutionResult;
    errors?: readonly GraphQLError[];
    headers?: Record<string, string>;
  }) {
    let response: Promise<FetcherResponse> | undefined;
    try {
      const maybeWithErrors = errors?.length ? ` with errors` : '';
      this.logger?.debug(
        `Sending \`${action}\` request to router` + maybeWithErrors,
        id,
      );
      return retry<FetcherResponse, Error>(
        async (bail) => {
          response = this.fetcher(url, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              ...headers,
            },
            body: JSON.stringify({
              kind: 'subscription',
              action,
              id,
              verifier,
              ...(payload && { payload }),
              ...(errors?.length && { errors }),
            }),
          });
          this.requestsInFlight.add(response);
          const result = await response;

          if (!result.ok) {
            if (result.status >= 500) {
              // Throwing here triggers a retry, which seems reasonable for 5xx
              // (i.e. an internal server error).
              throw new Error(
                `\`${action}\` request failed with unexpected status code: ${result.status}`,
              );
            } else {
              // For 4xx, we don't want to retry. These errors carry a semantic
              // meaning (terminate), so we bail. This will reject the promise and
              // should be handled by the caller. Specifically, 404 from the
              // router means terminate, but the protocol says that in other error
              // cases the subscription should be terminated due to an unexpected
              // error.
              if (result.status === 404) {
                this.logger?.debug(
                  `\`${action}\` request received 404, terminating subscription`,
                  id,
                );
              } else {
                const errMsg = `\`${action}\` request failed with unexpected status code: ${result.status}, terminating subscription`;
                this.logger?.debug(errMsg, id);
                bail(new Error(errMsg));
              }
              this.terminateSubscription(id, url);
              return result;
            }
          }
          this.logger?.debug(`\`${action}\` request successful`, id);
          return result;
        },
        {
          ...this.retryConfig,
          onRetry: (e, attempt) => {
            this.requestsInFlight.delete(response!);
            this.logger?.warn(
              `Retrying \`${action}\` request (attempt ${attempt}) due to error: ${e.message}`,
              id,
            );
            this.retryConfig?.onRetry?.(e, attempt);
          },
        },
      );
    } finally {
      this.requestsInFlight.delete(response!);
    }
  }

  // Implements sending the `check` request to the router. Fetch errors are
  // thrown and expected to be handled by the caller.
  async checkRequest({
    callbackUrl,
    id,
    verifier,
  }: {
    callbackUrl: string;
    id: string;
    verifier: string;
  }) {
    return this.retryFetch({
      url: callbackUrl,
      action: 'check',
      id,
      verifier,
      headers: { 'subscription-protocol': 'callback/1.0' },
    });
  }

  // Kicks off an interval that sends `heartbeat` requests to the router. If an
  // interval already exists for the callback url, we just add the new ID to its
  // list of IDs that it's sending a heartbeat for. This allows us to send one
  // batched heartbeat per interval per callback url.
  initHeartbeat({
    callbackUrl,
    id,
    verifier,
    heartbeatIntervalMs,
  }: {
    callbackUrl: string;
    id: string;
    verifier: string;
    heartbeatIntervalMs: number;
  }) {
    if (!this.subscriptionInfoByCallbackUrl.has(callbackUrl)) {
      this.subscriptionInfoByCallbackUrl.set(callbackUrl, {});
    }

    if (heartbeatIntervalMs === 0) {
      // Heartbeat has been disabled on the router
      this.logger?.debug(`Heartbeat disabled for ${callbackUrl}`, id);
      return;
    }

    // Kickoff heartbeat interval since there isn't one already
    this.logger?.debug(
      `Starting new heartbeat interval for ${callbackUrl}`,
      id,
    );

    let consecutiveHeartbeatFailureCount = 0;
    const heartbeatInterval = setInterval(async () => {
      let heartbeatRequest: Promise<FetcherResponse> | undefined;

      // XXX since we're on an interval, it's possible a heartbeat goes out
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
      const existingSubscriptionInfo =
        this.subscriptionInfoByCallbackUrl.get(callbackUrl);

      if (!existingSubscriptionInfo?.heartbeat) {
        // This is unexpected - if the interval is still running we should have
        // an entry in the map for it. But if we do end up here, there's no
        // reason to let the interval continue to run.
        clearInterval(heartbeatInterval);
        this.logger?.error(
          `Programming error: Heartbeat interval unexpectedly missing for ${callbackUrl}. This is probably a bug in Apollo Server.`,
        );
        return;
      }
      const existingHeartbeat = existingSubscriptionInfo.heartbeat;
      const { queue } = existingHeartbeat;
      queue.push(heartbeatPromise);
      if (queue.length > 1) {
        const requestBeforeMe = queue[existingHeartbeat?.queue.length - 2];
        await requestBeforeMe;
      }

      // Send the heartbeat request
      try {
        this.logger?.debug(
          `Sending \`check\` request to ${callbackUrl} for ID: ${id}`,
        );

        heartbeatRequest = this.fetcher(callbackUrl, {
          method: 'POST',
          body: JSON.stringify({
            kind: 'subscription',
            action: 'check',
            id,
            verifier,
          }),
          headers: {
            'content-type': 'application/json',
            'subscription-protocol': 'callback/1.0',
          },
        });
        this.requestsInFlight.add(heartbeatRequest);

        // heartbeat response might be a 4xx, in which case we'd need to
        // terminate the subscription, so we need to await it
        const result = await heartbeatRequest;

        this.logger?.debug(`Heartbeat received response for ID: ${id}`);
        if (result.ok) {
          this.logger?.debug(`Heartbeat request successful, ID: ${id}`);
        } else if (result.status === 400) {
          this.logger?.debug(`Heartbeat request received invalid ID: ${id}`);

          this.terminateSubscription(id, callbackUrl);
        } else if (result.status === 404) {
          // the id we sent is invalid
          this.logger?.debug(`Heartbeat request received invalid ID: ${id}`);
          // This will also handle cleaning up the heartbeat interval
          this.terminateSubscription(id, callbackUrl);
        } else {
          // We'll catch this below and log it with the expectation that we'll
          // retry this request some number of times before giving up
          throw new Error(`Unexpected status code: ${result.status}`);
        }

        // If we make it here, there wasn't some transient error with the
        // request and it had an expected status code (2xx, 400, 404).
        consecutiveHeartbeatFailureCount = 0;
      } catch (e) {
        const err = ensureError(e);
        // The heartbeat request failed.
        this.logger?.error(
          `Heartbeat request failed (${++consecutiveHeartbeatFailureCount} consecutive): ${
            err.message
          }`,
          existingHeartbeat.id,
        );

        if (
          consecutiveHeartbeatFailureCount >=
          this.maxConsecutiveHeartbeatFailures
        ) {
          this.logger?.error(
            `Heartbeat request failed ${consecutiveHeartbeatFailureCount} times, terminating subscriptions and heartbeat interval: ${err.message}`,
            existingHeartbeat.id,
          );
          // If we've failed 5 times in a row, we should terminate all
          // subscriptions for this callback url. This will also handle
          // cleaning up the heartbeat interval.
          this.terminateSubscription(id, callbackUrl);
        }
        return;
      } finally {
        if (heartbeatRequest) {
          this.requestsInFlight.delete(heartbeatRequest);
        }
        // remove itself from the queue and resolve the promise
        existingHeartbeat?.queue.shift();
        resolveHeartbeatPromise!();
      }
    }, heartbeatIntervalMs);

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
  private terminateSubscription(id: string, callbackUrl: string) {
    this.logger?.debug(`Terminating subscriptions for ID: ${id}`);
    const subscriptionInfo =
      this.subscriptionInfoByCallbackUrl.get(callbackUrl);
    if (!subscriptionInfo) {
      this.logger?.error(
        `No subscriptions found for ${callbackUrl}, skipping termination`,
      );
      return;
    }
    const { subscription, heartbeat } = subscriptionInfo;
    if (subscription) {
      subscription.cancelled = true;
      subscription.asyncIter?.return();
    }
    // cleanup heartbeat for subscription
    if (heartbeat) {
      this.logger?.debug(`Terminating heartbeat interval for ${callbackUrl}`);
      clearInterval(heartbeat.interval);
    }
    this.subscriptionInfoByCallbackUrl.delete(callbackUrl);
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
      asyncIter: subscription,
      cancelled: false,
      async startConsumingSubscription() {
        self.logger?.debug(`Listening to graphql-js subscription`, id);
        try {
          for await (const payload of subscription) {
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

            try {
              await self.retryFetch({
                url: callbackUrl,
                action: 'next',
                id,
                verifier,
                payload,
              });
            } catch (e) {
              const originalError = ensureError(e);
              self.logger?.error(
                `\`next\` request failed, terminating subscription: ${originalError.message}`,
                id,
              );
              self.terminateSubscription(id, callbackUrl);
            }
          }
          // The subscription ended without errors, send the `complete` request to
          // the router
          self.logger?.debug(`Subscription completed without errors`, id);
          await this.completeSubscription();
        } catch (e) {
          const error = ensureGraphQLError(e);
          self.logger?.error(
            `Generator threw an error, terminating subscription: ${error.message}`,
            id,
          );
          this.completeSubscription([error]);
        }
      },
      async completeSubscription(errors?: readonly GraphQLError[]) {
        if (this.cancelled) return;
        this.cancelled = true;

        try {
          await self.completeRequest({
            callbackUrl,
            id,
            verifier,
            ...(errors && { errors }),
          });
        } catch (e) {
          const error = ensureError(e);
          // This is just the `complete` request. If we fail to get this message
          // to the router, it should just invalidate the subscription after the
          // next heartbeat fails.
          self.logger?.error(
            `\`complete\` request failed: ${error.message}`,
            id,
          );
        } finally {
          self.terminateSubscription(id, callbackUrl);
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
    } else {
      subscriptionInfo.subscription = subscriptionObject;
    }
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
    return this.retryFetch({
      url: callbackUrl,
      action: 'complete',
      id,
      verifier,
      errors,
    });
  }

  collectAllSubscriptions() {
    return Array.from(this.subscriptionInfoByCallbackUrl.values()).reduce(
      (subscriptions, { subscription }) => {
        if (subscription) {
          subscriptions.push(subscription);
        }
        return subscriptions;
      },
      [] as SubscriptionObject[],
    );
  }

  async cleanup() {
    // Wait for our inflight heartbeats to finish - they might handle cancelling
    // some subscriptions
    await Promise.allSettled(
      Array.from(this.subscriptionInfoByCallbackUrl.values()).map(
        async ({ heartbeat }) => {
          clearInterval(heartbeat?.interval);
          await heartbeat?.queue[heartbeat.queue.length - 1];
        },
      ),
    );
    // Cancel / complete any still-active subscriptions
    await Promise.allSettled(
      this.collectAllSubscriptions()
        .filter((s) => !s.cancelled)
        .map((s) => s.completeSubscription()),
    );
    // Wait for any remaining requests to finish
    await Promise.allSettled(this.requestsInFlight.values());
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
