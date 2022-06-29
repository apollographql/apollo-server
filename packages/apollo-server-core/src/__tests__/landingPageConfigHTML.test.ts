import { getEmbeddedExplorerHTML, getEmbeddedSandboxHTML } from '../plugin/landingPage/default/index';

const version = '_latest';

describe('Landing Page Config HTML', () => {
  it('for embedded explorer with document, variables, headers and displayOptions provided', () => {
    const config = {
      includeCookies: true,
      document: 'query Test { id }',
      variables: {
        option: {
          a: 'val',
          b: 1,
          c: true,
        }
      },
      headers: { authorization: 'true' },
      embed: {
        displayOptions: {
          showHeadersAndEnvVars: true,
          docsPanelState: 'open' as 'open',
          theme: 'light' as 'light',
        },
        persistExplorerState: true,
      },
      graphRef: 'acephei@current'
    };
    const expected = `
<style>
  iframe {
    background-color: white;
  }
</style>
<div
style="width: 100vw; height: 100vh; position: absolute; top: 0;"
id="embeddableExplorer"
></div>
<script src="https://embeddable-explorer.cdn.apollographql.com/_latest/embeddable-explorer.umd.production.min.js"></script>
<script>
  var endpointUrl = window.location.href;
  var embeddedExplorerConfig = {"includeCookies":true,"document":"query Test { id }","variables":{"option":{"a":"val","b":1,"c":true}},"headers":{"authorization":"true"},"embed":{"displayOptions":{"showHeadersAndEnvVars":true,"docsPanelState":"open","theme":"light"},"persistExplorerState":true},"graphRef":"acephei@current","target":"#embeddableExplorer","initialState":{"includeCookies":true,"document":"query Test { id }","variables":{"option":{"a":"val","b":1,"c":true}},"headers":{"authorization":"true"},"embed":{"displayOptions":{"showHeadersAndEnvVars":true,"docsPanelState":"open","theme":"light"},"persistExplorerState":true},"graphRef":"acephei@current","displayOptions":{"showHeadersAndEnvVars":true,"docsPanelState":"open","theme":"light"}},"persistExplorerState":true};
  new window.EmbeddedExplorer({
    ...embeddedExplorerConfig,
    endpointUrl,
  });
</script>
`;
    const htmlString = getEmbeddedExplorerHTML(version, config);
    expect(htmlString).toEqual(expected);
  });

  it('for embedded explorer with document, variables, headers and displayOptions excluded', () => {
    const config = {
      includeCookies: false,
      embed: true as true,
      graphRef: 'acephei@current'
    };
    const expected = `
<style>
  iframe {
    background-color: white;
  }
</style>
<div
style="width: 100vw; height: 100vh; position: absolute; top: 0;"
id="embeddableExplorer"
></div>
<script src="https://embeddable-explorer.cdn.apollographql.com/_latest/embeddable-explorer.umd.production.min.js"></script>
<script>
  var endpointUrl = window.location.href;
  var embeddedExplorerConfig = {"includeCookies":false,"embed":true,"graphRef":"acephei@current","target":"#embeddableExplorer","initialState":{"includeCookies":false,"embed":true,"graphRef":"acephei@current","displayOptions":{}},"persistExplorerState":false};
  new window.EmbeddedExplorer({
    ...embeddedExplorerConfig,
    endpointUrl,
  });
</script>
`;
    const htmlString = getEmbeddedExplorerHTML(version, config);
    expect(htmlString).toEqual(expected);
  });

  it('for embedded sandbox with document, variables and headers provided', () => {
    const config = {
      includeCookies: true,
      document: 'query Test { id }',
      variables: {
        option: {
          a: 'val',
          b: 1,
          c: true,
        }
      },
      headers: { authorization: 'true' },
      displayOptions: {
        showHeadersAndEnvVariables: true,
        docsPanelState: 'open',
        theme: 'light',
      },
      embed: true as true,
    };
    const expected = `
<style>
  iframe {
    background-color: white;
  }
</style>
<div
style="width: 100vw; height: 100vh; position: absolute; top: 0;"
id="embeddableSandbox"
></div>
<script src="https://embeddable-sandbox.cdn.apollographql.com/_latest/embeddable-sandbox.umd.production.min.js"></script>
<script>
  var initialEndpoint = window.location.href;
  new window.EmbeddedSandbox({
    target: '#embeddableSandbox',
    initialEndpoint,
    includeCookies: true,
    initialState: {"document":"query Test { id }","variables":{"option":{"a":"val","b":1,"c":true}},"headers":{"authorization":"true"}},
  });
</script>
`;
    const htmlString = getEmbeddedSandboxHTML(version, config);
    expect(htmlString).toEqual(expected);
  });

  it('for embedded sandbox with document, variables and headers excluded', () => {
    const config = {
      includeCookies: false,
      embed: true as true,
    };
    const expected = `
<style>
  iframe {
    background-color: white;
  }
</style>
<div
style="width: 100vw; height: 100vh; position: absolute; top: 0;"
id="embeddableSandbox"
></div>
<script src="https://embeddable-sandbox.cdn.apollographql.com/_latest/embeddable-sandbox.umd.production.min.js"></script>
<script>
  var initialEndpoint = window.location.href;
  new window.EmbeddedSandbox({
    target: '#embeddableSandbox',
    initialEndpoint,
    includeCookies: false,
    initialState: {},
  });
</script>
`;
    const htmlString = getEmbeddedSandboxHTML(version, config);
    expect(htmlString).toEqual(expected);
  });
});
