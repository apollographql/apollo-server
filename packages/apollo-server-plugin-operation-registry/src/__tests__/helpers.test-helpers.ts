import { createHash } from 'crypto';
import { AgentOptions } from "../agent";
import {
  getStorageSecretUrl,
  urlStorageSecretBase,
  getOperationManifestUrl,
  urlOperationManifestBase,
  fakeTestBaseUrl,
} from '../common';
import nock from 'nock';
import { InMemoryLRUCache } from "apollo-server-caching";
import { Operation, OperationManifest } from "../ApolloServerPluginOperationRegistry";

export const defaultStore = () => new InMemoryLRUCache();

export const genericSchemaHash = 'abc123';
export const genericStorageSecret = 'someStorageSecret';
export const genericServiceID = 'test-service';
export const genericApiKeyHash = 'someapikeyhash123';
export const defaultTestAgentPollSeconds = 60;

export const defaultAgentOptions: AgentOptions = {
  engine: { serviceID: genericServiceID, apiKeyHash: genericApiKeyHash },
  store: defaultStore(),
  pollSeconds: defaultTestAgentPollSeconds,
  graphVariant: 'current',
};

// Each nock is good for exactly one request!

export function nockGoodManifestsUnderStorageSecret(
  graphId: string,
  storageSecret: string,
  operations: Operation[],
): nock.Scope {
  return nockStorageSecretOperationManifest(graphId, storageSecret, 200, {
    version: 2,
    operations,
  });
}

export function getStorageSecretPath(
  graphId: string,
  apiKeyHash: string,
) {
  return getStorageSecretUrl(graphId, apiKeyHash).replace(
    new RegExp(`^${urlStorageSecretBase}`),
    '',
  );
}

export function nockStorageSecret(
  graphId: string,
  apiKeyHash: string,
  status = 200,
  body: string = JSON.stringify(genericStorageSecret),
) {
  // Strip off the host for testing purposes with `nock`.
  return nockBase()
    .get(getStorageSecretPath(graphId, apiKeyHash))
    .reply(status, body);
}

export function getOperationManifestPath(
  graphId: string,
  storageSecret: string,
): string {
  // Strip off the host for testing purposes with `nock`.
  return getOperationManifestUrl(
    graphId,
    storageSecret,
  ).replace(new RegExp(`^${urlOperationManifestBase}`), '');
}

export function nockStorageSecretOperationManifest(
  graphId: string,
  storageSecret: string,
  status = 200,
  body?: OperationManifest,
) {
  return nockBase()
    .get(getOperationManifestPath(graphId, storageSecret))
    .reply(status, body);
}


export function nockBase() {
  return nock(fakeTestBaseUrl);
}

export function hashApiKey(apiKey: string): string {
  return createHash('sha512')
    .update(apiKey)
    .digest('hex');
}

export function hashedServiceId(serviceID: string): string {
  return createHash('sha512')
    .update(serviceID)
    .digest('hex');
}

function pathForServiceAndSchema(serviceID: string, schemaHash: string): string {
  return `/${hashedServiceId(serviceID)}/${schemaHash}.v2.json`;
}

