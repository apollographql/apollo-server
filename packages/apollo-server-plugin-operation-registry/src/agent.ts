import {
  getLegacyOperationManifestUrl,
  generateServiceIdHash,
  getStoreKey,
  pluginName,
  getStorageSecretUrl,
  getOperationManifestUrl,
} from './common';

import loglevel from 'loglevel';

import { Response } from 'node-fetch';
import { InMemoryLRUCache } from 'apollo-server-caching';
import { fetchIfNoneMatch } from './fetchIfNoneMatch';

const DEFAULT_POLL_SECONDS: number = 30;
const SYNC_WARN_TIME_SECONDS: number = 60;

export interface AgentOptions {
  logger?: loglevel.Logger;
  pollSeconds?: number;
  schemaHash: string;
  engine: any;
  store: InMemoryLRUCache;
}

interface Operation {
  signature: string;
  document: string;
}

interface OperationManifest {
  version: number;
  operations: Array<Operation>;
}

type SignatureStore = Set<string>;

export default class Agent {
  private timer?: NodeJS.Timer;
  private logger: loglevel.Logger;
  private hashedServiceId?: string;
  private requestInFlight: Promise<any> | null = null;
  private lastSuccessfulCheck?: Date;
  private storageSecret?: string;

  // Only exposed for testing.
  public _timesChecked: number = 0;

  private lastOperationSignatures: SignatureStore = new Set();
  private readonly options: AgentOptions = Object.create(null);

  constructor(options: AgentOptions) {
    Object.assign(this.options, options);

    this.logger = this.options.logger || loglevel.getLogger(pluginName);

    if (!this.options.schemaHash) {
      throw new Error('`schemaHash` must be passed to the Agent.');
    }

    if (
      typeof this.options.engine !== 'object' ||
      typeof this.options.engine.serviceID !== 'string'
    ) {
      throw new Error('`engine.serviceID` must be passed to the Agent.');
    }

    if (
      typeof this.options.engine !== 'object' ||
      typeof this.options.engine.apiKeyHash !== 'string'
    ) {
      throw new Error('`engine.apiKeyHash` must be passed to the Agent.');
    }
  }

  async requestPending() {
    return this.requestInFlight;
  }

  private getHashedServiceId(): string {
    return (this.hashedServiceId =
      this.hashedServiceId ||
      generateServiceIdHash(this.options.engine.serviceID));
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
        'The operation manifest could not be fetched.  Retries will continue, but requests will be forbidden until the manifest is fetched.',
        err.message || err,
      );
    }

    // Afterward, keep the pulse going.
    this.timer =
      this.timer ||
      setInterval(function() {
        // Errors in the interval indicate that the manifest might have failed
        // to update, but we've still got the seed update so we will continue
        // serving based on the previous manifest until we gain sync again.
        // These errors will be logged, but not crash the server.
        pulse().catch(err => console.error(err.message || err));
      }, this.pollSeconds() * 1000);
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
        `WARNING: More than ${SYNC_WARN_TIME_SECONDS} seconds has elapsed since a successful fetch of the manifest. (Last success: ${
          this.lastSuccessfulCheck
        })`,
      );
    }
  }

  private async fetchAndUpdateStorageSecret(): Promise<string | undefined> {
    const storageSecretUrl = getStorageSecretUrl(
      this.options.engine.serviceID,
      this.options.engine.apiKeyHash,
    );

    const response = await fetchIfNoneMatch(storageSecretUrl, {
      method: 'GET',
      // More than three times our polling interval be long enough to wait.
      timeout: this.pollSeconds() * 3 /* times */ * 1000 /* ms */,
    });

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

  private async fetchManifest(manifestUrl: string): Promise<Response> {
    this.logger.debug(`Checking for manifest changes at ${manifestUrl}`);

    let response = await fetchIfNoneMatch(manifestUrl, {
      // GET is what we request, but keep in mind that, when we include and get
      // a match on the `If-None-Match` header we'll get an early return with a
      // status code 304.
      method: 'GET',

      // More than three times our polling interval be long enough to wait.
      timeout: this.pollSeconds() * 3 /* times */ * 1000 /* ms */,
    });

    if (!response.ok && response.status !== 304) {
      const responseText = await response.text();

      // The response error code only comes in XML, but we don't have an XML
      // parser handy, so we'll just match the string.
      if (responseText.includes('<Code>AccessDenied</Code>')) {
        throw new Error(
          `No manifest found.  Ensure this server's schema has been published with 'apollo service:push' and that operations have been registered with 'apollo client:push'.`,
        );
      }

      // For other unknown errors.
      throw new Error(`Unexpected status: ${responseText}`);
    }

    return response;
  }

  private async tryUpdate(): Promise<boolean> {
    this.logger.debug(`Checking for storageSecret`);
    const storageSecret = await this.fetchAndUpdateStorageSecret();

    const legacyManifestUrl = getLegacyOperationManifestUrl(
      this.getHashedServiceId(),
      this.options.schemaHash,
    );

    this._timesChecked++;

    let response: Response;
    try {
      response = await (storageSecret
        ? this.fetchManifest(
            getOperationManifestUrl(
              this.options.engine.serviceID,
              storageSecret,
            ),
          ).catch(err => {
            this.logger.debug(
              `Failed to fetch manifest using storage secret. Try using legacy manifest url ${err.message ||
                err}`,
            );
            return this.fetchManifest(legacyManifestUrl);
          })
        : this.fetchManifest(legacyManifestUrl));

      // When the response indicates that the resource hasn't changed, there's
      // no need to do any other work.  Returning false is meant to indicate
      // that there wasn't an update, but there was a successful fetch.
      if (response.status === 304) {
        return false;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType !== 'application/json') {
        throw new Error(`Unexpected 'Content-Type' header: ${contentType}`);
      }
    } catch (err) {
      const ourErrorPrefix = `Unable to fetch operation manifest for ${
        this.options.schemaHash
      } in '${this.options.engine.serviceID}': ${err}`;

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
      .then(result => {
        // Mark this for reporting and monitoring reasons.
        this.lastSuccessfulCheck = new Date();
        resetRequestInFlight();
        return result;
      })
      .catch(err => {
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
