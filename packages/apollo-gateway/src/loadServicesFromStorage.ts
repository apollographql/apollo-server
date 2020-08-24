import { fetch } from 'apollo-server-env';
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
  'https://federation.api.apollographql.com/',
);

const urlStorageSecretBase: string = urlFromEnvOrDefault(
  envOverrideStorageSecretBaseUrl,
  'https://storage-secrets.api.apollographql.com/',
);

function getStorageSecretUrl(graphId: string, apiKeyHash: string): string {
  return `${urlStorageSecretBase}/${graphId}/storage-secret/${apiKeyHash}.json`;
}

function fetchApolloGcs(
  fetcher: typeof fetch,
  ...args: Parameters<typeof fetch>
): ReturnType<typeof fetch> {
  const [input, init] = args;

  // Used in logging.
  const url = typeof input === 'object' && input.url || input;

  return fetcher(input, init)
    .catch(fetchError => {
      throw new Error(
      "Cannot access Apollo Graph Manager storage: " + fetchError)
    })
    .then(async (response) => {
      // If the fetcher has a cache and has implemented ETag validation, then
      // a 304 response may be returned.  Either way, we will return the
      // non-JSON-parsed version and let the caller decide if that's important
      // to their needs.
      if (response.ok || response.status === 304) {
        return response;
      }

      // We won't make any assumptions that the body is anything but text, to
      // avoid parsing errors in this unknown condition.
      const body = await response.text();

      // Google Cloud Storage returns an `application/xml` error under error
      // conditions.  We'll special-case our known errors, and resort to
      // printing the body for others.
      if (
        response.headers.get('content-type') === 'application/xml' &&
        response.status === 403 &&
        body.includes("<Error><Code>AccessDenied</Code>") &&
        body.includes("Anonymous caller does not have storage.objects.get")
      ) {
          throw new Error(
            "Unable to authenticate with Apollo Graph Manager storage " +
            "while fetching " + url + ".  Ensure that the API key is " +
            "configured properly and that a federated service has been " +
            "pushed.  For details, see " +
            "https://go.apollo.dev/g/resolve-access-denied.");
      }

      // Normally, we'll try to keep the logs clean with errors we expect.
      // If it's not a known error, reveal the full body for debugging.
      throw new Error(
        "Could not communicate with Apollo Graph Manager storage: " + body);
    });
};

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
  fetcher: typeof fetch;
}): ReturnType<Experimental_UpdateServiceDefinitions> {
  // fetch the storage secret
  const storageSecretUrl = getStorageSecretUrl(graphId, apiKeyHash);

  // The storage secret is a JSON string (e.g. `"secret"`).
  const secret: string =
    await fetchApolloGcs(fetcher, storageSecretUrl).then(res => res.json());

  if (!graphVariant) {
    graphVariant = 'current';
  }

  const baseUrl = `${urlPartialSchemaBase}/${secret}/${graphVariant}/v${federationVersion}`;

  const compositionConfigResponse =
    await fetchApolloGcs(fetcher, `${baseUrl}/composition-config-link`);

  if (compositionConfigResponse.status === 304) {
    return { isNewSchema: false };
  }

  const linkFileResult: LinkFileResult = await compositionConfigResponse.json();

  const compositionMetadata: CompositionMetadata = await fetchApolloGcs(
    fetcher,
    `${urlPartialSchemaBase}/${linkFileResult.configPath}`,
  ).then(res => res.json());

  // It's important to maintain the original order here
  const serviceDefinitions = await Promise.all(
    compositionMetadata.implementingServiceLocations.map(
      async ({ name, path }) => {
        const { url, partialSchemaPath }: ImplementingService = await fetcher(
          `${urlPartialSchemaBase}/${path}`,
        ).then(response => response.json());

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
