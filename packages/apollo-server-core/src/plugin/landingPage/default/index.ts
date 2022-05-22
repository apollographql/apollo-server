import type { ImplicitlyInstallablePlugin } from '../../../ApolloServer';
import type {
  ApolloServerPluginEmbeddedLandingPageProductionDefaultOptions,
  ApolloServerPluginLandingPageLocalDefaultOptions,
  ApolloServerPluginLandingPageProductionDefaultOptions,
  LandingPageConfig,
} from './types';

export function ApolloServerPluginLandingPageLocalDefault(
  options: ApolloServerPluginLandingPageLocalDefaultOptions = {},
): ImplicitlyInstallablePlugin {
  const { version, __internal_apolloStudioEnv__, ...rest } = options;
  return ApolloServerPluginLandingPageDefault(version, {
    isProd: false,
    apolloStudioEnv: __internal_apolloStudioEnv__,
    ...rest,
  });
}

export function ApolloServerPluginLandingPageProductionDefault(
  options: ApolloServerPluginLandingPageProductionDefaultOptions = {},
): ImplicitlyInstallablePlugin {
  const { version, __internal_apolloStudioEnv__, ...rest } = options;
  return ApolloServerPluginLandingPageDefault(version, {
    isProd: true,
    apolloStudioEnv: __internal_apolloStudioEnv__,
    ...rest,
  });
}

// A triple encoding! Wow! First we use JSON.stringify to turn our object into a
// string. Then we encodeURIComponent so we don't have to stress about what
// would happen if the config contained `</script>`. Finally, we JSON.stringify
// it again, which in practice just wraps it in a pair of double quotes (since
// there shouldn't be any backslashes left after encodeURIComponent). The
// consumer of this needs to decodeURIComponent and then JSON.parse; there's
// only one JSON.parse because the outermost JSON string is parsed by the JS
// parser itself.
function encodeConfig(config: LandingPageConfig): string {
  return JSON.stringify(encodeURIComponent(JSON.stringify(config)));
}

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

const getEmbeddedExplorerHTML = (
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

    includeCookies?: boolean; // defaults to 'false'
  }
  const productionLandingPageConfigOrDefault = {
    displayOptions: {},
    persistExplorerState: false,
    ...(typeof config.embed === 'boolean' ? {} : config.embed),
  };
  const embeddedExplorerParams: Omit<EmbeddableExplorerOptions, 'endpointUrl'> =
    {
      ...config,
      target: '#embeddableExplorer',
      initialState: {
        ...config,
        displayOptions: {
          ...productionLandingPageConfigOrDefault.displayOptions,
        },
      },
      persistExplorerState:
        productionLandingPageConfigOrDefault.persistExplorerState,
    };

  return `
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

const getEmbeddedSandboxHTML = (version: string, config: LandingPageConfig) => {
  return `
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
    includeCookies: ${config.includeCookies ?? 'false'},
  });
</script>
`;
};

const getNonEmbeddedLandingPageHTML = (
  version: string,
  config: LandingPageConfig,
) => {
  const encodedConfig = encodeConfig(config);

  return `
<script>window.landingPage = ${encodedConfig};</script>
<script src="https://apollo-server-landing-page.cdn.apollographql.com/${version}/static/js/main.js"></script>`;
};

// Helper for the two actual plugin functions.
function ApolloServerPluginLandingPageDefault(
  maybeVersion: string | undefined,
  config: LandingPageConfig & {
    isProd: boolean;
    apolloStudioEnv: 'staging' | 'prod' | undefined;
  },
): ImplicitlyInstallablePlugin {
  const version = maybeVersion ?? '_latest';

  return {
    __internal_installed_implicitly__: false,
    async serverWillStart() {
      return {
        async renderLandingPage() {
          const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link
      rel="icon"
      href="https://apollo-server-landing-page.cdn.apollographql.com/${version}/assets/favicon.png"
    />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro&display=swap"
      rel="stylesheet"
    />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Apollo server landing page" />
    <link
      rel="apple-touch-icon"
      href="https://apollo-server-landing-page.cdn.apollographql.com/${version}/assets/favicon.png"
    />
    <link
      rel="manifest"
      href="https://apollo-server-landing-page.cdn.apollographql.com/${version}/manifest.json"
    />
    <title>Apollo Server</title>
  </head>
  <body style="margin: 0; overflow-x: hidden; overflow-y: hidden">
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="react-root">
      <style>
        .fallback {
          opacity: 0;
          animation: fadeIn 1s 1s;
          animation-iteration-count: 1;
          animation-fill-mode: forwards;
          padding: 1em;
        }
        @keyframes fadeIn {
          0% {opacity:0;}
          100% {opacity:1; }
        }
      </style>
      <div class="fallback">
        <h1>Welcome to Apollo Server</h1>
        <p>It appears that you might be offline. POST to this endpoint to query your graph:</p>
        <code style="white-space: pre;">
curl --request POST \\
  --header 'content-type: application/json' \\
  --url '<script>document.write(window.location.href)</script>' \\
  --data '{"query":"query { __typename }"}'</code>
      </div>
    ${
      config.embed
        ? 'graphRef' in config && config.graphRef
          ? getEmbeddedExplorerHTML(version, config)
          : getEmbeddedSandboxHTML(version, config)
        : getNonEmbeddedLandingPageHTML(version, config)
    }
    </div>
  </body>
</html>
          `;
          return { html };
        },
      };
    },
  };
}
