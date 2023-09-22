import { DEFAULT_EMBED_VERSION } from '../../../plugin/landingPage/default';
import { getEmbeddedSandboxHTML } from '../../../plugin/landingPage/default/getEmbeddedHTML';
import type { ApolloServerPluginEmbeddedLandingPageLocalDefaultOptions } from '../../../plugin/landingPage/default/types';
import { describe, it, expect } from '@jest/globals';

expect.addSnapshotSerializer(require('jest-serializer-html'));
const apolloServerVersion = '@apollo/server@4.0.0';

describe('Landing Page Config HTML', () => {
  it('for embedded sandbox with document, variables and headers provided', () => {
    const config: ApolloServerPluginEmbeddedLandingPageLocalDefaultOptions = {
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
      embed: true,
    };
    expect(
      getEmbeddedSandboxHTML(
        DEFAULT_EMBED_VERSION,
        config,
        apolloServerVersion,
        'nonce',
      ),
    ).toMatchInlineSnapshot(`
      <div class="fallback">
        <h1>
          Welcome to Apollo Server
        </h1>
        <p>
          Apollo Sandbox cannot be loaded; it appears that you might be offline.
        </p>
      </div>
      <style nonce="nonce">
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
      <div id="embeddableSandbox">
      </div>
      <script nonce="nonce"
              src="https://embeddable-sandbox.cdn.apollographql.com/17c6b43a4068da710c3713ec72f03dcb34bbd3de/embeddable-sandbox.umd.production.min.js?runtime=%40apollo%2Fserver%404.0.0"
      >
      </script>
      <script nonce="nonce">
        var initialEndpoint = window.location.href;
        var embeddedSandboxConfig = {"target":"#embeddableSandbox","initialState":{"document":"query Test { id }","variables":{"option":{"a":"val","b":1,"c":true}},"headers":{"authorization":"true"},"includeCookies":true},"hideCookieToggle":false,"endpointIsEditable":false,"runtime":"@apollo/server@4.0.0","runTelemetry":true,"sendOperationHeadersInIntrospection":false,"allowDynamicStyles":false};
        new window.EmbeddedSandbox(
          {
            ...embeddedSandboxConfig,
            initialEndpoint,
          }
        );
      </script>
    `);
  });

  it('for embedded sandbox with only headers provided', () => {
    const config: ApolloServerPluginEmbeddedLandingPageLocalDefaultOptions = {
      includeCookies: true,
      headers: { authorization: 'true' },
      embed: true,
    };
    expect(
      getEmbeddedSandboxHTML(
        DEFAULT_EMBED_VERSION,
        config,
        apolloServerVersion,
        'nonce',
      ),
    ).toMatchInlineSnapshot(`
      <div class="fallback">
        <h1>
          Welcome to Apollo Server
        </h1>
        <p>
          Apollo Sandbox cannot be loaded; it appears that you might be offline.
        </p>
      </div>
      <style nonce="nonce">
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
      <div id="embeddableSandbox">
      </div>
      <script nonce="nonce"
              src="https://embeddable-sandbox.cdn.apollographql.com/17c6b43a4068da710c3713ec72f03dcb34bbd3de/embeddable-sandbox.umd.production.min.js?runtime=%40apollo%2Fserver%404.0.0"
      >
      </script>
      <script nonce="nonce">
        var initialEndpoint = window.location.href;
        var embeddedSandboxConfig = {"target":"#embeddableSandbox","initialState":{"headers":{"authorization":"true"},"includeCookies":true},"hideCookieToggle":false,"endpointIsEditable":false,"runtime":"@apollo/server@4.0.0","runTelemetry":true,"sendOperationHeadersInIntrospection":false,"allowDynamicStyles":false};
        new window.EmbeddedSandbox(
          {
            ...embeddedSandboxConfig,
            initialEndpoint,
          }
        );
      </script>
    `);
  });

  it('for embedded sandbox with all config excluded', () => {
    const config: ApolloServerPluginEmbeddedLandingPageLocalDefaultOptions = {
      embed: true,
    };
    expect(
      getEmbeddedSandboxHTML(
        DEFAULT_EMBED_VERSION,
        config,
        apolloServerVersion,
        'nonce',
      ),
    ).toMatchInlineSnapshot(`
      <div class="fallback">
        <h1>
          Welcome to Apollo Server
        </h1>
        <p>
          Apollo Sandbox cannot be loaded; it appears that you might be offline.
        </p>
      </div>
      <style nonce="nonce">
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
      <div id="embeddableSandbox">
      </div>
      <script nonce="nonce"
              src="https://embeddable-sandbox.cdn.apollographql.com/17c6b43a4068da710c3713ec72f03dcb34bbd3de/embeddable-sandbox.umd.production.min.js?runtime=%40apollo%2Fserver%404.0.0"
      >
      </script>
      <script nonce="nonce">
        var initialEndpoint = window.location.href;
        var embeddedSandboxConfig = {"target":"#embeddableSandbox","initialState":{},"hideCookieToggle":false,"endpointIsEditable":false,"runtime":"@apollo/server@4.0.0","runTelemetry":true,"sendOperationHeadersInIntrospection":false,"allowDynamicStyles":false};
        new window.EmbeddedSandbox(
          {
            ...embeddedSandboxConfig,
            initialEndpoint,
          }
        );
      </script>
    `);
  });

  it('for embedded sandbox with operationId & collectionId provided', () => {
    const config: ApolloServerPluginEmbeddedLandingPageLocalDefaultOptions = {
      collectionId: '12345',
      operationId: 'abcdef',
      embed: true,
    };
    expect(
      getEmbeddedSandboxHTML(
        DEFAULT_EMBED_VERSION,
        config,
        apolloServerVersion,
        'nonce',
      ),
    ).toMatchInlineSnapshot(`
      <div class="fallback">
        <h1>
          Welcome to Apollo Server
        </h1>
        <p>
          Apollo Sandbox cannot be loaded; it appears that you might be offline.
        </p>
      </div>
      <style nonce="nonce">
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
      <div id="embeddableSandbox">
      </div>
      <script nonce="nonce"
              src="https://embeddable-sandbox.cdn.apollographql.com/17c6b43a4068da710c3713ec72f03dcb34bbd3de/embeddable-sandbox.umd.production.min.js?runtime=%40apollo%2Fserver%404.0.0"
      >
      </script>
      <script nonce="nonce">
        var initialEndpoint = window.location.href;
        var embeddedSandboxConfig = {"target":"#embeddableSandbox","initialState":{"collectionId":"12345","operationId":"abcdef"},"hideCookieToggle":false,"endpointIsEditable":false,"runtime":"@apollo/server@4.0.0","runTelemetry":true,"sendOperationHeadersInIntrospection":false,"allowDynamicStyles":false};
        new window.EmbeddedSandbox(
          {
            ...embeddedSandboxConfig,
            initialEndpoint,
          }
        );
      </script>
    `);
  });

  it('for embedded sandbox with endpointIsEditable, pollForSchemaUpdates, sharedHeaders provided', () => {
    const config: ApolloServerPluginEmbeddedLandingPageLocalDefaultOptions = {
      includeCookies: false,
      embed: {
        endpointIsEditable: true,
        initialState: {
          pollForSchemaUpdates: false,
          sharedHeaders: { SharedHeaderKey: 'SharedHeaderValue' },
        },
      },
    };
    expect(
      getEmbeddedSandboxHTML(
        DEFAULT_EMBED_VERSION,
        config,
        apolloServerVersion,
        'nonce',
      ),
    ).toMatchInlineSnapshot(`
      <div class="fallback">
        <h1>
          Welcome to Apollo Server
        </h1>
        <p>
          Apollo Sandbox cannot be loaded; it appears that you might be offline.
        </p>
      </div>
      <style nonce="nonce">
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
      <div id="embeddableSandbox">
      </div>
      <script nonce="nonce"
              src="https://embeddable-sandbox.cdn.apollographql.com/17c6b43a4068da710c3713ec72f03dcb34bbd3de/embeddable-sandbox.umd.production.min.js?runtime=%40apollo%2Fserver%404.0.0"
      >
      </script>
      <script nonce="nonce">
        var initialEndpoint = window.location.href;
        var embeddedSandboxConfig = {"target":"#embeddableSandbox","initialState":{"includeCookies":false,"pollForSchemaUpdates":false,"sharedHeaders":{"SharedHeaderKey":"SharedHeaderValue"}},"hideCookieToggle":false,"endpointIsEditable":true,"runtime":"@apollo/server@4.0.0","runTelemetry":true,"sendOperationHeadersInIntrospection":false,"allowDynamicStyles":false};
        new window.EmbeddedSandbox(
          {
            ...embeddedSandboxConfig,
            initialEndpoint,
          }
        );
      </script>
    `);
  });
});
