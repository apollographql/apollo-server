import { CachedFetcher } from './cachedFetcher';
import { ServiceDefinition } from '@apollo/federation';
import { parse } from 'graphql';
import createSHA from './utilities/createSHA';

export interface LinkFileResult {
  configPath: string;
  formatVersion: number;
}

export interface ImplementingService {
  formatVersion: number;
  graphID: string;
  graphVariant: string;
  name: string;
  revision: string;
  url: string;
  partialSchemaPath: string;
}

export interface ImplementingServiceLocation {
  name: string;
  path: string;
}

export interface ConfigFileResult {
  formatVersion: number;
  id: string;
  implementingServiceLocations: ImplementingServiceLocation[];
  schemaHash: string;
}

export const envOverrideOperationManifest = 'APOLLO_PARTIAL_SCHEMA_BASE_URL';
export const envOverrideStorageSecretBaseUrl = 'APOLLO_STORAGE_SECRET_BASE_URL';

const urlFromEnvOrDefault = (envKey: string, fallback: string) =>
  (process.env[envKey] || fallback).replace(/\/$/, '');

// Generate and cache our desired operation manifest URL.
const urlPartialSchemaBase = urlFromEnvOrDefault(
  envOverrideOperationManifest,
  'https://storage.googleapis.com/engine-partial-schema-prod/',
);

export const urlStorageSecretBase: string = urlFromEnvOrDefault(
  envOverrideStorageSecretBaseUrl,
  'https://storage.googleapis.com/engine-partial-schema-prod/',
);

const fetcher = new CachedFetcher();
let serviceDefinitionList: ServiceDefinition[] = [];

function getStorageSecretUrl(apiKey: string): string {
  const graphId = apiKey.split(':', 2)[1];
  const apiKeyHash = createSHA('sha512')
    .update(apiKey)
    .digest('hex');
  return `${urlStorageSecretBase}/${graphId}/storage-secret/${apiKeyHash}.json`;
}

async function fetchStorageSecret(apiKey: string): Promise<string> {
  const storageSecretUrl = getStorageSecretUrl(apiKey);
  const response = await fetcher.fetch(storageSecretUrl);
  return JSON.parse(response.result);
}

export async function getServiceDefinitionsFromStorage({
  apiKey,
  graphVariant,
  federationVersion = 1,
}: {
  apiKey: string;
  graphVariant: string;
  federationVersion: number;
}): Promise<[ServiceDefinition[], boolean]> {
  const secret = await fetchStorageSecret(apiKey);

  if (!graphVariant) {
    console.warn('No graphVariant specified, defaulting to "current".');
    graphVariant = 'current';
  }

  const baseUrl = `${urlPartialSchemaBase}/${secret}/${graphVariant}/v${federationVersion}`;

  const {
    isCacheHit: linkFileCacheHit,
    result: linkFileResult,
  } = await fetchLinkFile(baseUrl);

  // If the link file is a cache hit, no further work is needed
  if (linkFileCacheHit) return [serviceDefinitionList, false];

  const parsedLink = JSON.parse(linkFileResult) as LinkFileResult;

  const { result: configFileResult } = await fetcher.fetch(
    `${urlPartialSchemaBase}/${parsedLink.configPath}`,
  );

  const parsedConfig = JSON.parse(configFileResult) as ConfigFileResult;
  return fetchPartialSchemaFiles(parsedConfig.implementingServiceLocations);
}

async function fetchLinkFile(baseUrl: string) {
  return fetcher.fetch(`${baseUrl}/composition-config-link`);
}

// The order of implementingServices is IMPORTANT
async function fetchPartialSchemaFiles(
  implementingServices: ImplementingServiceLocation[],
): Promise<[ServiceDefinition[], boolean]> {
  let isDirty = false;
  const fetchPartialSchemasPromises = implementingServices.map(
    async ({ name, path }) => {
      const serviceLocation = await fetcher.fetch(
        `${urlPartialSchemaBase}/${path}`,
      );

      const { url, partialSchemaPath } = JSON.parse(
        serviceLocation.result,
      ) as ImplementingService;

      const { isCacheHit, result } = await fetcher.fetch(
        `${urlPartialSchemaBase}/${partialSchemaPath}`,
      );

      // Cache miss === dirty service, will need to be recomposed
      if (!isCacheHit) {
        isDirty = true;
      }

      return { name, url, typeDefs: parse(result) };
    },
  );

  // Respect the order here
  const services = await Promise.all(fetchPartialSchemasPromises);

  return [services, isDirty];
}
