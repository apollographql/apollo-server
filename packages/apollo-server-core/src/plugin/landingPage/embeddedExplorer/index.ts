import type { ImplicitlyInstallablePlugin } from '../../../ApolloServer';
import { printSchema } from 'graphql';

export interface ApolloServerPluginLandingPageEmbeddedExplorerOptions {
  /**
   * By default, the embedded explorer plugin uses the latest version of the landing
   * page published to Apollo's CDN. If you'd like to pin the current version,
   * pass the SHA served at
   * https://apollo-server-landing-page.cdn.apollographql.com/_latest/version.txt
   * here.
   */
  version?: string;
  /**
   * If specified, embed the explorer of the to the Studio page
   * for the given registered graphRef.
   * (You need to explicitly pass this here rather than
   * relying on the server's ApolloConfig, because if your server is publicly
   * accessible you may not want to display the graph ref publicly.)
   */
  graphRef?: string;
  /**
   * Folks can configure their embedded Explorer with a
   * document, variables and headers loaded in the UI.
   */
  document?: string;
  variables?: Record<string, string>;
  headers?: Record<string, string>;
  /**
   * We have two options for grabbing your schema for the embedded Explorer.
   * If you have a registered Studio graph, you can specify that graphRef,
   * and we will render the Explorer of your private graph using that registered schema.
   *
   * You also have the option to just use the schema running on this Apollo Server
   * instance.
   *
   * If this server is a gateway, the web app will poll your server with an
   * introspection query every 5 seconds to see if the schema has changed.
   * You can adjust this polling interval by setting this value,
   * or disable the polling by setting it to 0.
   * This param defaults to 0 for non-gateway servers because they have static schemas.
   *
   * If you are running a gateway, we will be default poll for your changing
   * schema every 5 seconds and show changes in the embedded Explorer.
   *
   * If you specify a graphRef, we ignore schemaPollIntervalMs & just
   * populate the schema with the registered graph's schema.
   */
  schemaPollIntervalMs?: number;
  /**
   * Display options can be configured for the embedded Explorer.
   */
  displayOptions?: {
    // If showHeadersAndEnvVars is false, we don't show the tab where users can input headers & env vars.
    showHeadersAndEnvVars: boolean;
    // The initial state for the left documentation panel in Explorer. Users can expand this when using the Explorer.
    docsPanelState: 'open' | 'closed';
    // TODO(maya): update this comment if we expose the settings panel in the embed
    // The theme for the embedded Explorer.  Users cannot configure this when using the Explorer.
    theme: 'light' | 'dark';
  };
  /**
   * Save client-side changes that a user makes to operations, variables and headers
   *  in embedded Explorer between page loads (via local storage).
   */
  persistExplorerState?: boolean;
}

// The actual config object read by the embed web app wrapper's React component.
interface EmbeddedLandingPageConfig {
  graphRef?: string | undefined;
  document?: string;
  variables?: Record<string, string>;
  headers?: Record<string, string>;
  includeCookies?: boolean;
  schemaPollIntervalMs?: number;
  // schema from Apollo Server
  // If your server is running a gateway, we will continue to poll your endpoint.
  // If not, we just use this schema to populate the embedded Explorer.
  initialSchema?: string;
  displayOptions?: {
    showHeadersAndEnvVars?: boolean;
    docsPanelState?: 'open' | 'closed';
    theme?: 'dark' | 'light';
  };
  persistExplorerState?: boolean;
}

// A triple encoding! Wow! First we use JSON.stringify to turn our object into a
// string. Then we encodeURIComponent so we don't have to stress about what
// would happen if the config contained `</script>`. Finally, we JSON.stringify
// it again, which in practice just wraps it in a pair of double quotes (since
// there shouldn't be any backslashes left after encodeURIComponent). The
// consumer of this needs to decodeURIComponent and then JSON.parse; there's
// only one JSON.parse because the outermost JSON string is parsed by the JS
// parser itself.
function encodeConfig(config: EmbeddedLandingPageConfig): string {
  return JSON.stringify(
    encodeURIComponent(
      JSON.stringify({ ...config, shouldEmbedExplorer: true }),
    ),
  );
}

export function ApolloServerPluginLandingPageEmbeddedExplorer(
  options: ApolloServerPluginLandingPageEmbeddedExplorerOptions = {},
): ImplicitlyInstallablePlugin {
  const { version: maybeVersion, ...rest } = options;

  const version = maybeVersion ?? '_latest';

  return {
    __internal_installed_implicitly__: false,
    async serverWillStart({ schema, isGateway }) {
      const encodedConfig = encodeConfig({
        includeCookies: false,
        persistExplorerState: false,
        schemaPollIntervalMs: isGateway ? 5000 : 0,
        ...(options.graphRef ? {} : { initialSchema: printSchema(schema) }),
        ...rest,
      });
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
    </div>
    <script>window.landingPage = ${encodedConfig};</script>
    <script src="https://apollo-server-landing-page.cdn.apollographql.com/${version}/static/js/main.js"></script>
  </body>
</html>
          `;
          return { html };
        },
      };
    },
  };
}
