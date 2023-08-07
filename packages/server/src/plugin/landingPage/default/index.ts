import type {
  ApolloServerPlugin,
  BaseContext,
} from '../../../externalTypes/index.js';
import type { ImplicitlyInstallablePlugin } from '../../../ApolloServer.js';
import type {
  ApolloServerPluginLandingPageLocalDefaultOptions,
  ApolloServerPluginLandingPageProductionDefaultOptions,
  LandingPageConfig,
} from './types.js';
import {
  getEmbeddedExplorerHTML,
  getEmbeddedSandboxHTML,
} from './getEmbeddedHTML.js';
import { packageVersion } from '../../../generated/packageVersion.js';
import { createHash } from '@apollo/utils.createhash';
import { v4 as uuidv4 } from 'uuid';

export type {
  ApolloServerPluginLandingPageLocalDefaultOptions,
  ApolloServerPluginLandingPageProductionDefaultOptions,
};

export function ApolloServerPluginLandingPageLocalDefault(
  options: ApolloServerPluginLandingPageLocalDefaultOptions = {},
): ApolloServerPlugin {
  const { version, __internal_apolloStudioEnv__, ...rest } = {
    // we default to Sandbox unless embed is specified as false
    embed: true as const,
    ...options,
  };
  return ApolloServerPluginLandingPageDefault(version, {
    isProd: false,
    apolloStudioEnv: __internal_apolloStudioEnv__,
    ...rest,
  });
}

export function ApolloServerPluginLandingPageProductionDefault(
  options: ApolloServerPluginLandingPageProductionDefaultOptions = {},
): ApolloServerPlugin {
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

const getNonEmbeddedLandingPageHTML = (
  cdnVersion: string,
  config: LandingPageConfig,
  apolloServerVersion: string,
  nonce: string,
) => {
  const encodedConfig = encodeConfig(config);

  return `
 <div class="fallback">
  <h1>Welcome to Apollo Server</h1>
  <p>The full landing page cannot be loaded; it appears that you might be offline.</p>
</div>
<script nonce="${nonce}">window.landingPage = ${encodedConfig};</script>
<script nonce="${nonce}" src="https://apollo-server-landing-page.cdn.apollographql.com/${encodeURIComponent(
    cdnVersion,
  )}/static/js/main.js?runtime=${apolloServerVersion}"></script>`;
};

// Helper for the two actual plugin functions.
function ApolloServerPluginLandingPageDefault<TContext extends BaseContext>(
  maybeVersion: string | undefined,
  config: LandingPageConfig & {
    isProd: boolean;
    apolloStudioEnv: 'staging' | 'prod' | undefined;
  },
): ImplicitlyInstallablePlugin<TContext> {
  const version = maybeVersion ?? '_latest';
  const apolloServerVersion = `@apollo/server@${packageVersion}`;

  const scriptSafeList = [
    'https://apollo-server-landing-page.cdn.apollographql.com',
    'https://embeddable-sandbox.cdn.apollographql.com',
    'https://embeddable-explorer.cdn.apollographql.com',
  ].join(' ');
  const styleSafeList = [
    'https://apollo-server-landing-page.cdn.apollographql.com',
    'https://embeddable-sandbox.cdn.apollographql.com',
    'https://embeddable-explorer.cdn.apollographql.com',
    'https://fonts.googleapis.com',
  ].join(' ');
  const iframeSafeList = [
    'https://explorer.embed.apollographql.com',
    'https://sandbox.embed.apollographql.com',
    'https://embed.apollo.local:3000',
  ].join(' ');

  return {
    __internal_installed_implicitly__: false,
    async serverWillStart(server) {
      if (config.precomputedNonce) {
        server.logger.warn(
          "The `precomputedNonce` landing page configuration option is deprecated. Removing this option is strictly an improvement to Apollo Server's landing page Content Security Policy (CSP) implementation for preventing XSS attacks.",
        );
      }
      return {
        async renderLandingPage() {
          const encodedVersion = encodeURIComponent(version);
          async function html() {
            const nonce =
              config.precomputedNonce ??
              createHash('sha256').update(uuidv4()).digest('hex');
            const scriptCsp = `script-src 'self' 'nonce-${nonce}' ${scriptSafeList}`;
            const styleCsp = `style-src 'nonce-${nonce}' ${styleSafeList}`;
            const imageCsp = `img-src https://apollo-server-landing-page.cdn.apollographql.com`;
            const manifestCsp = `manifest-src https://apollo-server-landing-page.cdn.apollographql.com`;
            const frameCsp = `frame-src ${iframeSafeList}`;
            return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="${scriptCsp}; ${styleCsp}; ${imageCsp}; ${manifestCsp}; ${frameCsp}" />
    <link
      rel="icon"
      href="https://apollo-server-landing-page.cdn.apollographql.com/${encodedVersion}/assets/favicon.png"
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
      href="https://apollo-server-landing-page.cdn.apollographql.com/${encodedVersion}/assets/favicon.png"
    />
    <link
      rel="manifest"
      href="https://apollo-server-landing-page.cdn.apollographql.com/${encodedVersion}/manifest.json"
    />
    <title>Apollo Server</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="react-root">
      <style nonce=${nonce}>
        body {
          margin: 0;
          overflow-x: hidden;
          overflow-y: hidden;
        }
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
    ${
      config.embed
        ? 'graphRef' in config && config.graphRef
          ? getEmbeddedExplorerHTML(version, config, apolloServerVersion, nonce)
          : !('graphRef' in config)
          ? getEmbeddedSandboxHTML(version, config, apolloServerVersion, nonce)
          : getNonEmbeddedLandingPageHTML(
              version,
              config,
              apolloServerVersion,
              nonce,
            )
        : getNonEmbeddedLandingPageHTML(
            version,
            config,
            apolloServerVersion,
            nonce,
          )
    }
    </div>
  </body>
</html>
          `;
          }
          return { html };
        },
      };
    },
  };
}
