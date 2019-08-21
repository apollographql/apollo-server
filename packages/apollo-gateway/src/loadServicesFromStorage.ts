import { CachedFetcher } from './cachedFetcher';
import { ServiceDefinition } from '@apollo/federation';
import { parse } from 'graphql';
import { UpdateServiceDefinitions } from '.';

interface LinkFileResult {
  configPath: string;
  formatVersion: number;
}

interface ImplementingService {
  formatVersion: number;
  graphID: string;
  graphVariant: string;
  name: string;
  revision: string;
  url: string;
  partialSchemaPath: string;
}

interface ImplementingServiceLocation {
  name: string;
  path: string;
}

export interface CompositionMetadata {
  formatVersion: number;
  id: string;
  implementingServiceLocations: ImplementingServiceLocation[];
  schemaHash: string;
}

const envOverrideOperationManifest = 'APOLLO_PARTIAL_SCHEMA_BASE_URL';
const envOverrideStorageSecretBaseUrl = 'APOLLO_STORAGE_SECRET_BASE_URL';

const urlFromEnvOrDefault = (envKey: string, fallback: string) =>
  (process.env[envKey] || fallback).replace(/\/$/, '');

// Generate and cache our desired operation manifest URL.
const urlPartialSchemaBase = urlFromEnvOrDefault(
  envOverrideOperationManifest,
  'https://storage.googleapis.com/engine-partial-schema-prod/',
);

const urlStorageSecretBase: string = urlFromEnvOrDefault(
  envOverrideStorageSecretBaseUrl,
  'https://storage.googleapis.com/engine-partial-schema-prod/',
);

const fetcher = new CachedFetcher();

function getStorageSecretUrl(graphId: string, apiKeyHash: string): string {
  return `${urlStorageSecretBase}/${graphId}/storage-secret/${apiKeyHash}.json`;
}

async function fetchStorageSecret(
  graphId: string,
  apiKeyHash: string,
): Promise<string> {
  const storageSecretUrl = getStorageSecretUrl(graphId, apiKeyHash);
  const response = await fetcher.fetch(storageSecretUrl);
  return JSON.parse(response.result);
}

export async function getServiceDefinitionsFromStorage({
  graphId,
  apiKeyHash,
  graphVariant,
  federationVersion,
}: {
  graphId: string;
  apiKeyHash: string;
  graphVariant?: string;
  federationVersion: number;
}): ReturnType<UpdateServiceDefinitions> {
  const secret = await fetchStorageSecret(graphId, apiKeyHash);

  if (!graphVariant) {
    graphVariant = 'current';
  }

  const baseUrl = `${urlPartialSchemaBase}/${secret}/${graphVariant}/v${federationVersion}`;

  const {
    isCacheHit: linkFileCacheHit,
    result: linkFileResult,
  } = await fetchLinkFile(baseUrl);

  // If the link file is a cache hit, no further work is needed
  if (linkFileCacheHit) return { isNewSchema: false };

  const parsedLink = JSON.parse(linkFileResult) as LinkFileResult;

  const { result: configFileResult } = await fetcher.fetch(
    `${urlPartialSchemaBase}/${parsedLink.configPath}`,
  );

  const compositionMetadata = JSON.parse(
    configFileResult,
  ) as CompositionMetadata;

  const serviceDefinitions = await fetchServiceDefinitions(
    compositionMetadata.implementingServiceLocations,
  );

  // explicity return that this is a new schema, as the link file has changed.
  // we can't use the hit property of the fetchPartialSchemaFiles, as the partial
  // schema may all be cache hits with the final schema still being new
  // (for instance if a partial schema is removed or a partial schema is rolled back to a prior version, which is still in cache)
  return {
    serviceDefinitions,
    compositionMetadata,
    isNewSchema: true,
  };
}

async function fetchLinkFile(baseUrl: string) {
  return fetcher.fetch(`${baseUrl}/composition-config-link`);
}

// The order of implementingServices is IMPORTANT
async function fetchServiceDefinitions(
  implementingServices: ImplementingServiceLocation[],
): Promise<ServiceDefinition[]> {
  const serviceDefinitionPromises = implementingServices.map(
    async ({ name, path }) => {
      const serviceLocation = await fetcher.fetch(
        `${urlPartialSchemaBase}/${path}`,
      );

      const { url, partialSchemaPath } = JSON.parse(
        serviceLocation.result,
      ) as ImplementingService;

      const { result } = await fetcher.fetch(
        `${urlPartialSchemaBase}/${partialSchemaPath}`,
      );

      return { name, url, typeDefs: parse(result) };
    },
  );

  // Respect the order here
  return Promise.all(serviceDefinitionPromises);
}
