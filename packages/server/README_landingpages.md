# How do the Apollo Server landing pages work?

If users don't manually install any plugin that implements `renderLandingPage`, Apollo Server does the following by default:

* In non-production environments (`NODE_ENV` is not `production`), Apollo Server installs `ApolloServerPluginLandingPageLocalDefault`.
* In production environments (`NODE_ENV` _is_ `production`), Apollo Server installs `ApolloServerPluginLandingPageProductionDefault`.

## Non-embedded landing page

The `ApolloServerPluginLandingPageProductionDefault` shows a minimalist landing page:

<img class="screenshot" src="../../docs/source/images/as-landing-page-production.jpg" alt="Apollo Server default landing page" width="350"/>

This landing page is rendered via a [script](https://github.com/apollographql/apollo-server/blob/159d73ca5bac3313c3950743fefc03400263cb0a/packages/server/src/plugin/landingPage/default/index.ts#L76-L78) tag in the index of the landingPage directory. This tag references a CDN upload that contains the built version of the contents of the [studio-landing-page](https://github.com/apollographql/studio-landing-page) repo. This repo uploads versioned and latest CDN bundles on merge to main.

Configuration params are passed from the user defined config in Apollo Server to the CDN bundle [via `window.landingPage`](https://github.com/apollographql/apollo-server/blob/159d73ca5bac3313c3950743fefc03400263cb0a/packages/server/src/plugin/landingPage/default/index.ts#L75). They are consumed in the studio-landing-page repo [here](https://github.com/apollographql/studio-landing-page/blob/e76e4acdc6207052b1599f4a0f66922976f57f2c/src/App.tsx#L42).

## Embedded landing pages

### Embedded local dev

The `ApolloServerPluginLandingPageLocalDefault` shows an embedded Sandbox:

<img class="screenshot" src="../../docs/source/images/sandbox.jpeg" alt="Apollo Sandbox" />

The embedded Sandbox is rendered via a [script](https://github.com/apollographql/apollo-server/blob/159d73ca5bac3313c3950743fefc03400263cb0a/packages/server/src/plugin/landingPage/default/getEmbeddedHTML.ts#L188-L192) tag in the index of the landingPage directory. This tag references a CDN upload that contains the built version of the contents of the [@apollo/sandbox](https://github.com/apollographql/embeddable-explorer/tree/main/packages/sandbox) package in the [embeddable-explorer repo](https://github.com/apollographql/embeddable-explorer). This repo uploads versioned and latest CDN bundles on merge to main.

Configuration params are passed to the window.EmbeddedSandbox instance which creates an [EmbeddedSandbox](https://github.com/apollographql/embeddable-explorer/blob/main/packages/sandbox/src/EmbeddedSandbox.ts) instance.

### Embedded production with graphRef

The `ApolloServerPluginLandingPageProductionDefault`, when configured with a [graphRef](https://github.com/apollographql/apollo-server/blob/159d73ca5bac3313c3950743fefc03400263cb0a/packages/server/src/plugin/landingPage/default/index.ts#L180-L181), shows an embedded Explorer.

The embedded Explorer is rendered via a [script](https://github.com/apollographql/apollo-server/blob/159d73ca5bac3313c3950743fefc03400263cb0a/packages/server/src/plugin/landingPage/default/getEmbeddedHTML.ts#L113-L117) tag in the index of the landingPage directory. This tag references a CDN upload that contains the built version of the contents of the [@apollo/explorer](https://github.com/apollographql/embeddable-explorer/tree/main/packages/explorer) package in the [embeddable-explorer repo](https://github.com/apollographql/embeddable-explorer). This repo uploads versioned and latest CDN bundles on merge to main.

Configuration params are passed to the window.EmbeddedExplorer instance which creates an [EmbeddedSandbox](https://github.com/apollographql/embeddable-explorer/blob/main/packages/explorer/src/EmbeddedExplorer.ts) instance.
