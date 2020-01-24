import { CachedFetcher } from './cachedFetcher';
import { parse } from 'graphql';
import { Experimental_UpdateServiceDefinitions } from '.';

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

const envOverridePartialSchemaBaseUrl = 'APOLLO_PARTIAL_SCHEMA_BASE_URL';
const envOverrideStorageSecretBaseUrl = 'APOLLO_STORAGE_SECRET_BASE_URL';

const urlFromEnvOrDefault = (envKey: string, fallback: string) =>
  (process.env[envKey] || fallback).replace(/\/$/, '');

// Generate and cache our desired operation manifest URL.
const urlPartialSchemaBase = urlFromEnvOrDefault(
  envOverridePartialSchemaBaseUrl,
  'https://storage.googleapis.com/engine-partial-schema-prod/',
);

const urlStorageSecretBase: string = urlFromEnvOrDefault(
  envOverrideStorageSecretBaseUrl,
  'https://storage.googleapis.com/engine-partial-schema-prod/',
);

function getStorageSecretUrl(graphId: string, apiKeyHash: string): string {
  return `${urlStorageSecretBase}/${graphId}/storage-secret/${apiKeyHash}.json`;
}

export async function getServiceDefinitionsFromStorage({
  graphId,
  apiKeyHash,
  graphVariant,
  federationVersion,
  fetcher,
}: {
  graphId: string;
  apiKeyHash: string;
  graphVariant?: string;
  federationVersion: number;
  fetcher: CachedFetcher;
}): ReturnType<Experimental_UpdateServiceDefinitions> {
  // fetch the storage secret
  const storageSecretUrl = getStorageSecretUrl(graphId, apiKeyHash);
  const response = await fetcher.fetch(storageSecretUrl);
  const secret = JSON.parse(response.result);

  if (!graphVariant) {
    graphVariant = 'current';
  }

  const baseUrl = `${urlPartialSchemaBase}/${secret}/${graphVariant}/v${federationVersion}`;

  const {
    isCacheHit: linkFileCacheHit,
    result: linkFileResult,
  } = await fetcher.fetch(`${baseUrl}/composition-config-link`);

  // If the link file is a cache hit, no further work is needed
  if (linkFileCacheHit) return { isNewSchema: false };

  const parsedLink = JSON.parse(linkFileResult) as LinkFileResult;

  const { result: configFileResult } = await fetcher.fetch(
    `${urlPartialSchemaBase}/${parsedLink.configPath}`,
  );

  const compositionMetadata = JSON.parse(
    configFileResult,
  ) as CompositionMetadata;

  // It's important to maintain the original order here
  const serviceDefinitions = await Promise.all(
    compositionMetadata.implementingServiceLocations.map(
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
    ),
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
