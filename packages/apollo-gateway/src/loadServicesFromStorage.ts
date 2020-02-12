import { Fetcher } from 'make-fetch-happen';
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
  fetcher: Fetcher;
}): ReturnType<Experimental_UpdateServiceDefinitions> {
  // fetch the storage secret
  const storageSecretUrl = getStorageSecretUrl(graphId, apiKeyHash);

  const secret = await fetcher(storageSecretUrl).then(response =>
    response.json(),
  );

  if (!graphVariant) {
    graphVariant = 'current';
  }

  const baseUrl = `${urlPartialSchemaBase}/${secret}/${graphVariant}/v${federationVersion}`;

  const response = await fetcher(`${baseUrl}/composition-config-link`);

  if (response.status === 304) {
    return { isNewSchema: false };
  }

  const linkFileResult = await response.json() as LinkFileResult;

  const compositionMetadata = (await fetcher(
    `${urlPartialSchemaBase}/${linkFileResult.configPath}`,
  ).then(response => response.json())) as CompositionMetadata;

  // It's important to maintain the original order here
  const serviceDefinitions = await Promise.all(
    compositionMetadata.implementingServiceLocations.map(
      async ({ name, path }) => {
        const { url, partialSchemaPath } = (await fetcher(
          `${urlPartialSchemaBase}/${path}`,
        ).then(response => response.json())) as ImplementingService;

        const sdl = await fetcher(
          `${urlPartialSchemaBase}/${partialSchemaPath}`,
        ).then(response => response.text());

        return { name, url, typeDefs: parse(sdl) };
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
