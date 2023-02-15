import type {
  ApolloServerPluginEmbeddedLandingPageProductionDefaultOptions,
  LandingPageConfig,
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
function getConfigStringForHtml(config: LandingPageConfig) {
  return JSON.stringify(config)
    .replace('<', '\\u003c')
    .replace('>', '\\u003e')
    .replace('&', '\\u0026')
    .replace("'", '\\u0027');
}

export const getEmbeddedExplorerHTML = (
  version: string,
  config: ApolloServerPluginEmbeddedLandingPageProductionDefaultOptions,
) => {
  interface EmbeddableExplorerOptions {
    graphRef: string;
    target: string;

    initialState?: {
      document?: string;
      variables?: Record<string, any>;
      headers?: Record<string, string>;
      displayOptions: {
        docsPanelState?: 'open' | 'closed'; // default to 'open',
        showHeadersAndEnvVars?: boolean; // default to `false`
        theme?: 'dark' | 'light';
      };
    };
    persistExplorerState?: boolean; // defaults to 'false'

    endpointUrl: string;

    hideCookieToggle?: boolean; // defaults to 'true'
  }
  const productionLandingPageConfigOrDefault = {
    displayOptions: {},
    persistExplorerState: false,
    ...(typeof config.embed === 'boolean' ? {} : config.embed),
  };
  const embeddedExplorerParams: Omit<EmbeddableExplorerOptions, 'endpointUrl'> =
    {
      graphRef: config.graphRef,
      target: '#embeddableExplorer',
      initialState: {
        ...config,
        displayOptions: {
          ...productionLandingPageConfigOrDefault.displayOptions,
        },
      },
      persistExplorerState:
        productionLandingPageConfigOrDefault.persistExplorerState,
      hideCookieToggle: false,
    };

  return `
<div class="fallback">
  <h1>Welcome to Apollo Server</h1>
  <p>Apollo Explorer cannot be loaded; it appears that you might be offline.</p>
</div>
<style>
  iframe {
    background-color: white;
  }
</style>
<div
style="width: 100vw; height: 100vh; position: absolute; top: 0;"
id="embeddableExplorer"
></div>
<script src="https://embeddable-explorer.cdn.apollographql.com/${version}/embeddable-explorer.umd.production.min.js"></script>
<script>
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
  version: string,
  config: LandingPageConfig,
) => {
  return `
<div class="fallback">
  <h1>Welcome to Apollo Server</h1>
  <p>Apollo Sandbox cannot be loaded; it appears that you might be offline.</p>
</div>
<style>
  iframe {
    background-color: white;
  }
</style>
<div
style="width: 100vw; height: 100vh; position: absolute; top: 0;"
id="embeddableSandbox"
></div>
<script src="https://embeddable-sandbox.cdn.apollographql.com/${version}/embeddable-sandbox.umd.production.min.js"></script>
<script>
  var initialEndpoint = window.location.href;
  new window.EmbeddedSandbox({
    target: '#embeddableSandbox',
    initialEndpoint,
    initialState: ${getConfigStringForHtml({
      document: config.document ?? undefined,
      variables: config.variables ?? undefined,
      headers: config.headers ?? undefined,
      includeCookies: config.includeCookies ?? undefined,
    })},
    hideCookieToggle: false,
  });
</script>
`;
};
