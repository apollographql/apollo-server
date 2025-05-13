import type {
  ApolloServerPluginEmbeddedLandingPageLocalDefaultOptions,
  ApolloServerPluginEmbeddedLandingPageProductionDefaultOptions,
} from './types';

// This function turns an object into a string and replaces
// <, >, &, ' with their unicode chars to avoid adding html tags to
// the landing page html that might be passed from the config.
// The only place these characters can appear in the output of
// JSON.stringify is within string literals, where they can equally
// well appear \u-escaped. This specifically means that
// `</script>` won't terminate the script block early.
// (Perhaps we should have done this instead of the triple-encoding
// of encodeConfig for the main landing page.)
function getConfigStringForHtml(config: object) {
  return JSON.stringify(config)
    .replace('<', '\\u003c')
    .replace('>', '\\u003e')
    .replace('&', '\\u0026')
    .replace("'", '\\u0027');
}

export const getEmbeddedExplorerHTML = (
  explorerCdnVersion: string,
  config: ApolloServerPluginEmbeddedLandingPageProductionDefaultOptions,
  apolloServerVersion: string,
  nonce: string,
) => {
  interface EmbeddableExplorerOptions {
    graphRef: string;
    target: string;

    initialState?: {
      document?: string;
      variables?: Record<string, any>;
      headers?: Record<string, string>;
      collectionId?: string;
      operationId?: string;
      displayOptions: {
        docsPanelState?: 'open' | 'closed'; // default to 'open',
        showHeadersAndEnvVars?: boolean; // default to `false`
        theme?: 'dark' | 'light';
      };
    };
    persistExplorerState?: boolean; // defaults to 'false'

    endpointUrl: string;

    includeCookies?: boolean; // defaults to 'false'

    runTelemetry?: boolean;

    allowDynamicStyles?: boolean; // defaults to 'true'
  }
  const productionLandingPageEmbedConfigOrDefault = {
    displayOptions: {},
    persistExplorerState: false,
    runTelemetry: true,
    ...(typeof config.embed === 'boolean' ? {} : config.embed),
  };
  const embeddedExplorerParams: Omit<
    EmbeddableExplorerOptions,
    'endpointUrl'
  > & { runtime: string } = {
    graphRef: config.graphRef,
    target: '#embeddableExplorer',
    initialState: {
      ...('document' in config || 'headers' in config || 'variables' in config
        ? {
            document: config.document,
            headers: config.headers,
            variables: config.variables,
          }
        : {}),
      ...('collectionId' in config
        ? {
            collectionId: config.collectionId,
            operationId: config.operationId,
          }
        : {}),
      displayOptions: {
        ...productionLandingPageEmbedConfigOrDefault.displayOptions,
      },
    },
    persistExplorerState:
      productionLandingPageEmbedConfigOrDefault.persistExplorerState,
    includeCookies: config.includeCookies,
    runtime: apolloServerVersion,
    runTelemetry: productionLandingPageEmbedConfigOrDefault.runTelemetry,
    allowDynamicStyles: false, // disabled for CSP - we add the iframe styles ourselves instead
  };

  return `
<div class="fallback">
  <h1>Welcome to Apollo Server</h1>
  <p>Apollo Explorer cannot be loaded; it appears that you might be offline.</p>
</div>
<style nonce=${nonce}>
  iframe {
    background-color: white;
    height: 100%;
    width: 100%;
    border: none;
  }
  #embeddableExplorer {
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0;
  }
</style>
<div id="embeddableExplorer"></div>
<script nonce="${nonce}" src="https://embeddable-explorer.cdn.apollographql.com/${encodeURIComponent(
    explorerCdnVersion,
  )}/embeddable-explorer.umd.production.min.js?runtime=${encodeURIComponent(
    apolloServerVersion,
  )}"></script>
<script nonce="${nonce}">
  var endpointUrl = window.location.href;
  var embeddedExplorerConfig = ${getConfigStringForHtml(
    embeddedExplorerParams,
  )};
  new window.EmbeddedExplorer({
    ...embeddedExplorerConfig,
    endpointUrl,
  });
</script>
`;
};

export const getEmbeddedSandboxHTML = (
  sandboxCdnVersion: string,
  config: ApolloServerPluginEmbeddedLandingPageLocalDefaultOptions,
  apolloServerVersion: string,
  nonce: string,
) => {
  const localDevelopmentEmbedConfigOrDefault = {
    runTelemetry: true,
    endpointIsEditable: false,
    initialState: {},
    ...(typeof config.embed === 'boolean' ? {} : (config.embed ?? {})),
  };
  const embeddedSandboxConfig = {
    target: '#embeddableSandbox',
    initialState: {
      ...('document' in config || 'headers' in config || 'variables' in config
        ? {
            document: config.document,
            variables: config.variables,
            headers: config.headers,
          }
        : {}),
      ...('collectionId' in config
        ? {
            collectionId: config.collectionId,
            operationId: config.operationId,
          }
        : {}),
      includeCookies: config.includeCookies,
      ...localDevelopmentEmbedConfigOrDefault.initialState,
    },
    hideCookieToggle: false,
    endpointIsEditable: localDevelopmentEmbedConfigOrDefault.endpointIsEditable,
    runtime: apolloServerVersion,
    runTelemetry: localDevelopmentEmbedConfigOrDefault.runTelemetry,
    allowDynamicStyles: false, // disabled for CSP - we add the iframe styles ourselves instead
  };
  return `
<div class="fallback">
  <h1>Welcome to Apollo Server</h1>
  <p>Apollo Sandbox cannot be loaded; it appears that you might be offline.</p>
</div>
<style nonce=${nonce}>
  iframe {
    background-color: white;
    height: 100%;
    width: 100%;
    border: none;
  }
  #embeddableSandbox {
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0;
  }
</style>
<div id="embeddableSandbox"></div>
<script nonce="${nonce}" src="https://embeddable-sandbox.cdn.apollographql.com/${encodeURIComponent(
    sandboxCdnVersion,
  )}/embeddable-sandbox.umd.production.min.js?runtime=${encodeURIComponent(
    apolloServerVersion,
  )}"></script>
<script nonce="${nonce}">
  var initialEndpoint = window.location.href;
  var embeddedSandboxConfig = ${getConfigStringForHtml(embeddedSandboxConfig)};
  new window.EmbeddedSandbox(
    {
      ...embeddedSandboxConfig,
      initialEndpoint,
    }
  );
</script>
`;
};
