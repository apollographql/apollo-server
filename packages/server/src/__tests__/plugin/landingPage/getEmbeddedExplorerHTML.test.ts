import { DEFAULT_EMBEDDED_EXPLORER_VERSION } from '../../../plugin/landingPage/default';
import { getEmbeddedExplorerHTML } from '../../../plugin/landingPage/default/getEmbeddedHTML';
import type { ApolloServerPluginEmbeddedLandingPageProductionDefaultOptions } from '../../../plugin/landingPage/default/types';
import { describe, it, expect } from '@jest/globals';

const cdnVersion = DEFAULT_EMBEDDED_EXPLORER_VERSION;
expect.addSnapshotSerializer(require('jest-serializer-html'));
const apolloServerVersion = '@apollo/server@4.0.0';

describe('Embedded Explorer Landing Page Config HTML', () => {
  it('with document, variables, headers and displayOptions provided', () => {
    const config: ApolloServerPluginEmbeddedLandingPageProductionDefaultOptions =
      {
        includeCookies: true,
        document: 'query Test { id }',
        variables: {
          option: {
            a: 'val',
            b: 1,
            c: true,
          },
        },
        headers: { authorization: 'true' },
        embed: {
          displayOptions: {
            showHeadersAndEnvVars: true,
            docsPanelState: 'open',
            theme: 'light',
          },
          persistExplorerState: true,
        },
        graphRef: 'graph@current',
      };
    expect(
      getEmbeddedExplorerHTML(cdnVersion, config, apolloServerVersion, 'nonce'),
    ).toMatchInlineSnapshot(`
      <div class="fallback">
        <h1>
          Welcome to Apollo Server
        </h1>
        <p>
          Apollo Explorer cannot be loaded; it appears that you might be offline.
        </p>
      </div>
      <style nonce="nonce">
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
      <div id="embeddableExplorer">
      </div>
      <script nonce="nonce"
              src="https://embeddable-explorer.cdn.apollographql.com/v3/embeddable-explorer.umd.production.min.js?runtime=%40apollo%2Fserver%404.0.0"
      >
      </script>
      <script nonce="nonce">
        var endpointUrl = window.location.href;
        var embeddedExplorerConfig = {"graphRef":"graph@current","target":"#embeddableExplorer","initialState":{"document":"query Test { id }","headers":{"authorization":"true"},"variables":{"option":{"a":"val","b":1,"c":true}},"displayOptions":{"showHeadersAndEnvVars":true,"docsPanelState":"open","theme":"light"}},"persistExplorerState":true,"includeCookies":true,"runtime":"@apollo/server@4.0.0","runTelemetry":true,"allowDynamicStyles":false};
        new window.EmbeddedExplorer({
          ...embeddedExplorerConfig,
          endpointUrl,
        });
      </script>
    `);
  });

  it('with only headers provided', () => {
    const config: ApolloServerPluginEmbeddedLandingPageProductionDefaultOptions =
      {
        includeCookies: true,
        headers: { authorization: 'true' },
        embed: true,
        graphRef: 'graph@current',
      };
    expect(
      getEmbeddedExplorerHTML(cdnVersion, config, apolloServerVersion, 'nonce'),
    ).toMatchInlineSnapshot(`
      <div class="fallback">
        <h1>
          Welcome to Apollo Server
        </h1>
        <p>
          Apollo Explorer cannot be loaded; it appears that you might be offline.
        </p>
      </div>
      <style nonce="nonce">
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
      <div id="embeddableExplorer">
      </div>
      <script nonce="nonce"
              src="https://embeddable-explorer.cdn.apollographql.com/v3/embeddable-explorer.umd.production.min.js?runtime=%40apollo%2Fserver%404.0.0"
      >
      </script>
      <script nonce="nonce">
        var endpointUrl = window.location.href;
        var embeddedExplorerConfig = {"graphRef":"graph@current","target":"#embeddableExplorer","initialState":{"headers":{"authorization":"true"},"displayOptions":{}},"persistExplorerState":false,"includeCookies":true,"runtime":"@apollo/server@4.0.0","runTelemetry":true,"allowDynamicStyles":false};
        new window.EmbeddedExplorer({
          ...embeddedExplorerConfig,
          endpointUrl,
        });
      </script>
    `);
  });

  it('with operationId, collectionId provided', () => {
    const config: ApolloServerPluginEmbeddedLandingPageProductionDefaultOptions =
      {
        includeCookies: true,
        collectionId: '12345',
        operationId: 'abcdef',
        embed: true,
        graphRef: 'graph@current',
      };
    expect(
      getEmbeddedExplorerHTML(cdnVersion, config, apolloServerVersion, 'nonce'),
    ).toMatchInlineSnapshot(`
      <div class="fallback">
        <h1>
          Welcome to Apollo Server
        </h1>
        <p>
          Apollo Explorer cannot be loaded; it appears that you might be offline.
        </p>
      </div>
      <style nonce="nonce">
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
      <div id="embeddableExplorer">
      </div>
      <script nonce="nonce"
              src="https://embeddable-explorer.cdn.apollographql.com/v3/embeddable-explorer.umd.production.min.js?runtime=%40apollo%2Fserver%404.0.0"
      >
      </script>
      <script nonce="nonce">
        var endpointUrl = window.location.href;
        var embeddedExplorerConfig = {"graphRef":"graph@current","target":"#embeddableExplorer","initialState":{"collectionId":"12345","operationId":"abcdef","displayOptions":{}},"persistExplorerState":false,"includeCookies":true,"runtime":"@apollo/server@4.0.0","runTelemetry":true,"allowDynamicStyles":false};
        new window.EmbeddedExplorer({
          ...embeddedExplorerConfig,
          endpointUrl,
        });
      </script>
    `);
  });

  it('for embedded explorer with document, variables, headers and displayOptions excluded', () => {
    const config: ApolloServerPluginEmbeddedLandingPageProductionDefaultOptions =
      {
        includeCookies: false,
        embed: true,
        graphRef: 'graph@current',
      };
    expect(
      getEmbeddedExplorerHTML(cdnVersion, config, apolloServerVersion, 'nonce'),
    ).toMatchInlineSnapshot(`
      <div class="fallback">
        <h1>
          Welcome to Apollo Server
        </h1>
        <p>
          Apollo Explorer cannot be loaded; it appears that you might be offline.
        </p>
      </div>
      <style nonce="nonce">
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
      <div id="embeddableExplorer">
      </div>
      <script nonce="nonce"
              src="https://embeddable-explorer.cdn.apollographql.com/v3/embeddable-explorer.umd.production.min.js?runtime=%40apollo%2Fserver%404.0.0"
      >
      </script>
      <script nonce="nonce">
        var endpointUrl = window.location.href;
        var embeddedExplorerConfig = {"graphRef":"graph@current","target":"#embeddableExplorer","initialState":{"displayOptions":{}},"persistExplorerState":false,"includeCookies":false,"runtime":"@apollo/server@4.0.0","runTelemetry":true,"allowDynamicStyles":false};
        new window.EmbeddedExplorer({
          ...embeddedExplorerConfig,
          endpointUrl,
        });
      </script>
    `);
  });

  it('with runTelemetry false', () => {
    const config: ApolloServerPluginEmbeddedLandingPageProductionDefaultOptions =
      {
        includeCookies: true,
        headers: { authorization: 'true' },
        embed: {
          runTelemetry: false,
        },
        graphRef: 'graph@current',
      };
    expect(
      getEmbeddedExplorerHTML(cdnVersion, config, apolloServerVersion, 'nonce'),
    ).toMatchInlineSnapshot(`
      <div class="fallback">
        <h1>
          Welcome to Apollo Server
        </h1>
        <p>
          Apollo Explorer cannot be loaded; it appears that you might be offline.
        </p>
      </div>
      <style nonce="nonce">
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
      <div id="embeddableExplorer">
      </div>
      <script nonce="nonce"
              src="https://embeddable-explorer.cdn.apollographql.com/v3/embeddable-explorer.umd.production.min.js?runtime=%40apollo%2Fserver%404.0.0"
      >
      </script>
      <script nonce="nonce">
        var endpointUrl = window.location.href;
        var embeddedExplorerConfig = {"graphRef":"graph@current","target":"#embeddableExplorer","initialState":{"headers":{"authorization":"true"},"displayOptions":{}},"persistExplorerState":false,"includeCookies":true,"runtime":"@apollo/server@4.0.0","runTelemetry":false,"allowDynamicStyles":false};
        new window.EmbeddedExplorer({
          ...embeddedExplorerConfig,
          endpointUrl,
        });
      </script>
    `);
  });
});
