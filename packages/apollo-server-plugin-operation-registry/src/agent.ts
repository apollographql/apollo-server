import {
  getStoreKey,
  pluginName,
  getStorageSecretUrl,
  getOperationManifestUrl,
} from './common';

import loglevel from 'loglevel';
import fetcher from 'make-fetch-happen';
import { HttpRequestCache } from './cache';

import { InMemoryLRUCache } from 'apollo-server-caching';
import { OperationManifest } from './ApolloServerPluginOperationRegistry';
import { Logger, ApolloConfig, WithRequired } from 'apollo-server-types';
import { Response, RequestInit, fetch } from 'apollo-server-env';

const DEFAULT_POLL_SECONDS: number = 30;
const SYNC_WARN_TIME_SECONDS: number = 60;

export interface AgentOptions {
  logger?: Logger;
  fetcher?: typeof fetch;
  pollSeconds?: number;
  apollo: WithRequired<ApolloConfig, 'keyHash' | 'graphRef'>;
  store: InMemoryLRUCache;
}

type SignatureStore = Set<string>;

const callToAction = `Ensure this server's schema has been published with 'apollo service:push' and that operations have been registered with 'apollo client:push'.`;

export default class Agent {
  private fetcher: typeof fetch;
  private timer?: NodeJS.Timer;
  private logger: Logger;
  private requestInFlight: Promise<any> | null = null;
  private lastSuccessfulCheck?: Date;
  private storageSecret?: string;

  // Only exposed for testing.
  public _timesChecked: number = 0;

  private lastOperationSignatures: SignatureStore = new Set();
  private readonly options: AgentOptions = Object.create(null);

  // We've made most of our protocols capable of just taking a graph ref,
  // meaning that we can later iterate on the semantics of graph refs without
  // needing to make changes to Apollo Server. But not the operation registry!
  // We really need to know the pieces separately. *sigh*
  private readonly graphId: string;
  readonly graphVariant: string;

  constructor(options: AgentOptions) {
    Object.assign(this.options, options);

    const { graphRef } = this.options.apollo;
    const at = graphRef.indexOf('@');
    if (at === -1) {
      this.graphId = graphRef;
      this.graphVariant = 'current';
    } else {
      this.graphId = graphRef.substring(0, at);
      this.graphVariant = graphRef.substring(at + 1);
    }
    this.logger = this.options.logger || loglevel.getLogger(pluginName);
    this.fetcher = this.options.fetcher || getDefaultGcsFetcher();
  }

  async requestPending() {
    return this.requestInFlight;
  }

  private pollSeconds() {
    return this.options.pollSeconds || DEFAULT_POLL_SECONDS;
  }

  async start() {
    this.logger.debug('Starting operation registry agent...');

    // This is what we'll trigger at a regular interval.
    const pulse = async () => await this.checkForUpdate();

    // The first pulse should happen before we start the timer.
    try {
      await pulse();
    } catch (err) {
      console.error(
        'The operation manifest could not be fetched. Retries will continue, but requests will be forbidden until the manifest is fetched.',
        err.message || err,
      );
    }

    // Afterward, keep the pulse going.
    this.timer =
      this.timer ||
      setInterval(function () {
        // Errors in the interval indicate that the manifest might have failed
        // to update, but we've still got the seed update so we will continue
        // serving based on the previous manifest until we gain sync again.
        // These errors will be logged, but not crash the server.
        pulse().catch((err) => console.error(err.message || err));
      }, this.pollSeconds() * 1000);

    // Prevent the Node.js event loop from remaining active (and preventing,
    // e.g. process shutdown) by calling `unref` on the `Timeout`.  For more
    // information, see https://nodejs.org/api/timers.html#timers_timeout_unref.
    this.timer.unref();
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private timeSinceLastSuccessfulCheck() {
    if (!this.lastSuccessfulCheck) {
      // So far back that it's never?
      return -Infinity;
    }
    return new Date().getTime() - this.lastSuccessfulCheck.getTime();
  }

  private warnWhenLossOfSync() {
    // This is probably good information to reveal in general, though nice
    // to have in development.
    if (this.timeSinceLastSuccessfulCheck() > SYNC_WARN_TIME_SECONDS * 1000) {
      console.warn(
        `WARNING: More than ${SYNC_WARN_TIME_SECONDS} seconds has elapsed since a successful fetch of the manifest. (Last success: ${this.lastSuccessfulCheck})`,
      );
    }
  }

  private async fetchAndUpdateStorageSecret(): Promise<string | undefined> {
    const storageSecretUrl = getStorageSecretUrl(
      this.graphId,
      this.options.apollo.keyHash,
    );

    const response = await this.fetcher(storageSecretUrl, this.fetchOptions);

    if (response.status === 304) {
      this.logger.debug(
        'The storage secret was the same as the previous attempt.',
      );
      return this.storageSecret;
    }

    if (!response.ok) {
      const responseText = await response.text();
      this.logger.debug(`Could not fetch storage secret ${responseText}`);
      return;
    }

    this.storageSecret = await response.json();

    return this.storageSecret;
  }

  private fetchOptions: RequestInit = {
    // More than three times our polling interval should be long enough to wait.
    timeout: this.pollSeconds() * 3 /* times */ * 1000 /* ms */,
  };

  private async fetchManifest(): Promise<Response> {
    this.logger.debug(`Checking for storageSecret`);
    const storageSecret = await this.fetchAndUpdateStorageSecret();

    if (!storageSecret) {
      throw new Error('No storage secret found');
    }

    const storageSecretManifestUrl = getOperationManifestUrl(
      this.graphId,
      storageSecret,
      this.graphVariant,
    );

    this.logger.debug(
      `Checking for manifest changes at ${storageSecretManifestUrl}`,
    );
    const response = await this.fetcher(
      storageSecretManifestUrl,
      this.fetchOptions,
    );

    if (response.status === 404 || response.status === 403) {
      throw new Error(
        `No manifest found for tag "${this.graphVariant}" at ` +
          `${storageSecretManifestUrl}. ${callToAction}`,
      );
    }
    return response;
  }

  private async tryUpdate(): Promise<boolean> {
    this._timesChecked++;

    let response: Response;
    try {
      response = await this.fetchManifest();
      // When the response indicates that the resource hasn't changed, there's
      // no need to do any other work.  Returning false is meant to indicate
      // that there wasn't an update, but there was a successful fetch.
      if (response.status === 304) {
        return false;
      }

      if (!response.ok) {
        const responseText = await response.text();
        // The response error code only comes in XML, but we don't have an XML
        // parser handy, so we'll just match the string.
        if (responseText.includes('<Code>AccessDenied</Code>')) {
          throw new Error(`No manifest found. ${callToAction}`);
        }
        // For other unknown errors.
        throw new Error(`Unexpected status: ${responseText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType !== 'application/json') {
        throw new Error(`Unexpected 'Content-Type' header: ${contentType}`);
      }
    } catch (err) {
      const ourErrorPrefix = `Unable to fetch operation manifest for graph ID '${this.graphId}': ${err}`;

      err.message = `${ourErrorPrefix}: ${err}`;

      throw err;
    }

    await this.updateManifest(await response.json());
    // True is good!
    return true;
  }

  public async checkForUpdate() {
    // Display a warning message if things have fallen abnormally behind.
    this.warnWhenLossOfSync();

    // Don't check again if we're already in-flight.
    if (this.requestInFlight) {
      return this.requestInFlight;
    }

    // Prevent other requests from crossing paths.
    this.requestInFlight = this.tryUpdate();

    const resetRequestInFlight = () => (this.requestInFlight = null);

    return this.requestInFlight
      .then((result) => {
        // Mark this for reporting and monitoring reasons.
        this.lastSuccessfulCheck = new Date();
        resetRequestInFlight();
        return result;
      })
      .catch((err) => {
        // We don't want to handle any errors, but we do want to erase the
        // current Promise reference.
        resetRequestInFlight();
        throw err;
      });
  }

  public async updateManifest(manifest: OperationManifest) {
    if (
      !manifest ||
      manifest.version !== 2 ||
      !Array.isArray(manifest.operations)
    ) {
      throw new Error('Invalid manifest format.');
    }

    const incomingOperations: Map<string, string> = new Map();
    const replacementSignatures: SignatureStore = new Set();

    for (const { signature, document } of manifest.operations) {
      incomingOperations.set(signature, document);
      // Keep track of each operation in this manifest so we can store it
      // for comparison after the next fetch.
      replacementSignatures.add(signature);

      // If it it's _not_ in the last fetch, we know it's added.  We could
      // just set it — which would be less costly, but it's nice to have this
      // for debugging.
      if (!this.lastOperationSignatures.has(signature)) {
        // Newly added operation.
        this.logger.debug(`Incoming manifest ADDs: ${signature}`);
        this.options.store.set(getStoreKey(signature), document);
      }
    }

    // Explicitly purge items which have been removed since our last
    // successful fetch of the manifest.
    for (const signature of this.lastOperationSignatures) {
      if (!incomingOperations.has(signature)) {
        // Remove operations which are no longer present.
        this.logger.debug(`Incoming manifest REMOVEs: ${signature}`);
        this.options.store.delete(getStoreKey(signature));
      }
    }

    // Save the ones from this fetch, so we know what to remove on the next
    // actual update.  Particularly important since a future distributed
    // store might not actually let us look this up again.
    this.lastOperationSignatures = replacementSignatures;
  }
}

const GCS_RETRY_COUNT = 5;

function getDefaultGcsFetcher() {
  return fetcher.defaults({
    cacheManager: new HttpRequestCache(),
    // All headers should be lower-cased here, as `make-fetch-happen`
    // treats differently cased headers as unique (unlike the `Headers` object).
    // @see: https://git.io/JvRUa
    headers: {
      'user-agent': [
        require('../package.json').name,
        require('../package.json').version,
      ].join('/'),
    },
    retry: {
      retries: GCS_RETRY_COUNT,
      // The default factor: expected attempts at 0, 1, 3, 7, 15, and 31 seconds elapsed
      factor: 2,
      // 1 second
      minTimeout: 1000,
      randomize: true,
    },
  });
}
