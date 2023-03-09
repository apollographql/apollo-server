import { getEmbeddedExplorerHTML } from '../../../plugin/landingPage/default/getEmbeddedHTML';
import type { ApolloServerPluginEmbeddedLandingPageProductionDefaultOptions } from '../../../plugin/landingPage/default/types';
import { describe, it, expect } from '@jest/globals';

const version = '_latest';
expect.addSnapshotSerializer(require('jest-serializer-html'));

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
    expect(getEmbeddedExplorerHTML(version, config)).toMatchInlineSnapshot(`
      <div class="fallback">
        <h1>
          Welcome to Apollo Server
        </h1>
        <p>
          Apollo Explorer cannot be loaded; it appears that you might be offline.
        </p>
      </div>
      <style>
        iframe {
          background-color: white;
        }
      </style>
      <div style="width: 100vw; height: 100vh; position: absolute; top: 0;"
           id="embeddableExplorer"
      >
      </div>
      <script src="https://embeddable-explorer.cdn.apollographql.com/_latest/embeddable-explorer.umd.production.min.js">
      </script>
      <script>
        var endpointUrl = window.location.href;
        var embeddedExplorerConfig = {"graphRef":"graph@current","target":"#embeddableExplorer","initialState":{"document":"query Test { id }","headers":{"authorization":"true"},"variables":{"option":{"a":"val","b":1,"c":true}},"displayOptions":{"showHeadersAndEnvVars":true,"docsPanelState":"open","theme":"light"}},"persistExplorerState":true,"includeCookies":true};
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
        embed: true as true,
        graphRef: 'graph@current',
      };
    expect(getEmbeddedExplorerHTML(version, config)).toMatchInlineSnapshot(`
      <div class="fallback">
        <h1>
          Welcome to Apollo Server
        </h1>
        <p>
          Apollo Explorer cannot be loaded; it appears that you might be offline.
        </p>
      </div>
      <style>
        iframe {
          background-color: white;
        }
      </style>
      <div style="width: 100vw; height: 100vh; position: absolute; top: 0;"
           id="embeddableExplorer"
      >
      </div>
      <script src="https://embeddable-explorer.cdn.apollographql.com/_latest/embeddable-explorer.umd.production.min.js">
      </script>
      <script>
        var endpointUrl = window.location.href;
        var embeddedExplorerConfig = {"graphRef":"graph@current","target":"#embeddableExplorer","initialState":{"displayOptions":{}},"persistExplorerState":false,"includeCookies":false};
        new window.EmbeddedExplorer({
          ...embeddedExplorerConfig,
          endpointUrl,
        });
      </script>
    `);
  });
});
