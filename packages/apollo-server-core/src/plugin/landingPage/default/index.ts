import type { ImplicitlyInstallablePlugin } from '../../../ApolloServer';

export interface ApolloServerPluginLandingPageDefaultBaseOptions {
  /**
   * By default, the landing page plugin uses the latest version of the landing
   * page published to Apollo's CDN. If you'd like to pin the current version,
   * pass the SHA served at
   * https://apollo-server-landing-page.cdn.apollographql.com/_latest/version.txt
   * here.
   */
  version?: string;
  /**
   * Set to false to suppress the footer which explains how to configure the
   * landing page.
   */
  footer?: boolean;
  /**
   * Folks can configure their landing page to link to Studio Explorer with a
   * document, variables and headers loaded in the UI.
   */
  document?: string;
  variables?: Record<string, string>;
  headers?: Record<string, string>;
  // For Apollo use only.
  __internal_apolloStudioEnv__?: 'staging' | 'prod';
}

export interface ApolloServerPluginLandingPageLocalDefaultOptions
  extends ApolloServerPluginLandingPageDefaultBaseOptions {}

export interface ApolloServerPluginLandingPageProductionDefaultOptions
  extends ApolloServerPluginLandingPageDefaultBaseOptions {
  /**
   * If specified, provide a link (with opt-in auto-redirect) to the Studio page
   * for the given graphRef. (You need to explicitly pass this here rather than
   * relying on the server's ApolloConfig, because if your server is publicly
   * accessible you may not want to display the graph ref publicly.)
   */
  graphRef?: string;
}

// The actual config object read by the landing page's React component.
interface LandingPageConfig {
  graphRef?: string | undefined;
  isProd?: boolean;
  apolloStudioEnv?: 'staging' | 'prod';
  document?: string;
  variables?: Record<string, string>;
  headers?: Record<string, string>;
  footer?: boolean;
}

export function ApolloServerPluginLandingPageLocalDefault(
  options: ApolloServerPluginLandingPageLocalDefaultOptions = {},
): ImplicitlyInstallablePlugin {
  // We list known keys explicitly to get better typechecking, but we pass
  // through extras in case we've added new keys to the splash page and haven't
  // quite updated the plugin yet.
  const { version, __internal_apolloStudioEnv__, footer, ...rest } = options;
  return ApolloServerPluginLandingPageDefault(
    version,
    encodeConfig({
      isProd: false,
      apolloStudioEnv: __internal_apolloStudioEnv__,
      footer,
      ...rest,
    }),
  );
}

export function ApolloServerPluginLandingPageProductionDefault(
  options: ApolloServerPluginLandingPageProductionDefaultOptions = {},
): ImplicitlyInstallablePlugin {
  // We list known keys explicitly to get better typechecking, but we pass
  // through extras in case we've added new keys to the splash page and haven't
  // quite updated the plugin yet.
  const { version, __internal_apolloStudioEnv__, footer, graphRef, ...rest } =
    options;
  return ApolloServerPluginLandingPageDefault(
    version,
    encodeConfig({
      isProd: true,
      apolloStudioEnv: __internal_apolloStudioEnv__,
      footer,
      graphRef,
      ...rest,
    }),
  );
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

// Helper for the two actual plugin functions.
function ApolloServerPluginLandingPageDefault(
  maybeVersion: string | undefined,
  encodedConfig: string,
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
