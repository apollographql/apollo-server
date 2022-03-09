var plugins = [{
      name: 'gatsby-plugin-react-helmet',
      plugin: require('/Users/shanemyrick/src/github/apollographql/apollo-server/docs/node_modules/gatsby-plugin-react-helmet/gatsby-ssr'),
      options: {"plugins":[]},
    },{
      name: 'gatsby-remark-autolink-headers',
      plugin: require('/Users/shanemyrick/src/github/apollographql/apollo-server/docs/node_modules/gatsby-remark-autolink-headers/gatsby-ssr'),
      options: {"plugins":[],"offsetY":72,"className":"anchor"},
    },{
      name: 'gatsby-plugin-mdx',
      plugin: require('/Users/shanemyrick/src/github/apollographql/apollo-server/docs/node_modules/gatsby-plugin-mdx/gatsby-ssr'),
      options: {"plugins":[],"gatsbyRemarkPlugins":[{"resolve":"gatsby-remark-autolink-headers","options":{"offsetY":72}},{"resolve":"gatsby-remark-copy-linked-files","options":{"ignoreFileExtensions":[]}},{"resolve":"gatsby-remark-mermaid","options":{"mermaidOptions":{"themeCSS":"\n            .node rect,\n            .node circle,\n            .node polygon,\n            .node path {\n              stroke-width: 2px;\n              stroke: #3f20ba;\n              fill: #F4F6F8;\n            }\n            .node.secondary rect,\n            .node.secondary circle,\n            .node.secondary polygon,\n            .node.tertiary rect,\n            .node.tertiary circle,\n            .node.tertiary polygon {\n              fill: white;\n            }\n            .node.secondary rect,\n            .node.secondary circle,\n            .node.secondary polygon {\n              stroke: #832363;\n            }\n            .cluster rect,\n            .node.tertiary rect,\n            .node.tertiary circle,\n            .node.tertiary polygon {\n              stroke: #1d7b78;\n            }\n            .cluster rect {\n              fill: none;\n              stroke-width: 2px;\n            }\n            .label, .edgeLabel {\n              background-color: white;\n              line-height: 1.3;\n            }\n            .edgeLabel rect {\n              background: none;\n              fill: none;\n            }\n            .messageText, .noteText, .loopText {\n              font-size: 12px;\n              stroke: none;\n            }\n            g rect, polygon.labelBox {\n              stroke-width: 2px;\n            }\n            g rect.actor {\n              stroke: #1d7b78;\n              fill: white;\n            }\n            g rect.note {\n              stroke: #832363;\n              fill: white;\n            }\n            g line.loopLine, polygon.labelBox {\n              stroke: #3f20ba;\n              fill: white;\n            }\n          "}}},"gatsby-remark-code-titles",{"resolve":"gatsby-remark-prismjs","options":{"showLineNumbers":true}},"gatsby-remark-rewrite-relative-links",{"resolve":"gatsby-remark-check-links"}],"remarkPlugins":[[null,{"wrapperComponent":"MultiCodeBlock","throwOnError":true,"prettierOptions":{"trailingComma":"all","singleQuote":true}}]],"extensions":[".mdx"],"defaultLayouts":{},"lessBabel":false,"rehypePlugins":[],"mediaTypes":["text/markdown","text/x-markdown"],"root":"/Users/shanemyrick/src/github/apollographql/apollo-server/docs"},
    },{
      name: 'gatsby-plugin-google-gtag',
      plugin: require('/Users/shanemyrick/src/github/apollographql/apollo-server/docs/node_modules/gatsby-plugin-google-gtag/gatsby-ssr'),
      options: {"plugins":[],"trackingIds":["UA-74643563-13","G-0BGG5V2W2K"]},
    },{
      name: 'gatsby-plugin-google-tagmanager',
      plugin: require('/Users/shanemyrick/src/github/apollographql/apollo-server/docs/node_modules/gatsby-plugin-google-tagmanager/gatsby-ssr'),
      options: {"plugins":[],"id":"GTM-M964NS9","includeInDevelopment":false,"defaultDataLayer":null,"routeChangeEventName":"gatsby-route-change","enableWebVitalsTracking":false,"selfHostedOrigin":"https://www.googletagmanager.com"},
    },{
      name: 'gatsby-plugin-apollo-onetrust',
      plugin: require('/Users/shanemyrick/src/github/apollographql/apollo-server/docs/node_modules/gatsby-plugin-apollo-onetrust/gatsby-ssr'),
      options: {"plugins":[]},
    },{
      name: 'gatsby-theme-apollo-docs',
      plugin: require('/Users/shanemyrick/src/github/apollographql/apollo-server/docs/node_modules/gatsby-theme-apollo-docs/gatsby-ssr'),
      options: {"plugins":[],"siteName":"Apollo Docs","pageTitle":"Apollo GraphQL Docs","menuTitle":"Apollo Platform","gaTrackingId":["UA-74643563-13","G-0BGG5V2W2K"],"gtmContainerId":"GTM-M964NS9","baseUrl":"https://www.apollographql.com","twitterHandle":"apollographql","gaViewId":"163147389","youtubeUrl":"https://www.youtube.com/channel/UC0pEW_GOrMJ23l8QcrGdKSw","logoLink":"https://www.apollographql.com/docs/","baseDir":"docs","contentDir":"source","navConfig":{"Apollo Basics":{"category":"Core","url":"https://www.apollographql.com/docs","description":"Learn about each part of the Apollo platform and how they all work together.","omitLandingPage":true},"Apollo Client (React)":{"docset":"react","category":"Apollo Client","shortName":"JS / React","url":"https://www.apollographql.com/docs/react","description":"Manage your React app's state and seamlessly execute GraphQL operations.","topArticles":[{"title":"Get started","url":"https://www.apollographql.com/docs/react/get-started/"},{"title":"Queries","url":"https://www.apollographql.com/docs/react/data/queries/"},{"title":"Caching overview","url":"https://www.apollographql.com/docs/react/caching/overview/"}]},"Apollo Client (iOS)":{"docset":"ios","category":"Apollo Client","shortName":"iOS","url":"https://www.apollographql.com/docs/ios","description":"Manage your iOS app's state and seamlessly execute GraphQL operations.","topArticles":[{"title":"Tutorial","url":"https://www.apollographql.com/docs/ios/tutorial/tutorial-introduction/"},{"title":"Downloading a schema","url":"https://www.apollographql.com/docs/ios/downloading-schema/"},{"title":"Fetching queries","url":"https://www.apollographql.com/docs/ios/fetching-queries/"}]},"Apollo Client (Kotlin)":{"docset":"kotlin","category":"Apollo Client","shortName":"Kotlin / Android","url":"https://www.apollographql.com/docs/kotlin","description":"Manage your Kotlin app's state and seamlessly execute GraphQL operations.","topArticles":[{"title":"Tutorial","url":"https://www.apollographql.com/docs/kotlin/tutorial/00-introduction/"},{"title":"Queries","url":"https://www.apollographql.com/docs/kotlin/essentials/queries/"},{"title":"Normalized cache","url":"https://www.apollographql.com/docs/kotlin/essentials/normalized-cache/"}]},"Apollo Server":{"docset":"apollo-server","category":"Backend","url":"https://www.apollographql.com/docs/apollo-server","description":"Configure a production-ready GraphQL server to fetch and combine data from multiple sources.","topArticles":[{"title":"Get started","url":"https://www.apollographql.com/docs/apollo-server/getting-started/"},{"title":"Schema basics","url":"https://www.apollographql.com/docs/apollo-server/schema/schema/"},{"title":"Resolvers","url":"https://www.apollographql.com/docs/apollo-server/data/resolvers/"}]},"Apollo Federation":{"docset":"federation","category":"Backend","url":"https://www.apollographql.com/docs/federation","description":"Implement a single unified graph across multiple subgraphs.","topArticles":[{"title":"Introduction","url":"https://www.apollographql.com/docs/federation/"},{"title":"Quickstart","url":"https://www.apollographql.com/docs/federation/quickstart/"},{"title":"Enterprise guide","url":"https://www.apollographql.com/docs/federation/enterprise-guide/introduction/"}]},"Apollo Router (alpha)":{"docset":"router","category":"Backend","url":"https://www.apollographql.com/docs/router","description":"Optimize your federated graph with a high-performance graph router written in Rust.","omitLandingPage":true},"Apollo Studio":{"docset":"studio","category":"Tools","url":"https://www.apollographql.com/docs/graph-manager","description":"Build your graph with your team, evolve it safely, and keep it running smoothly.","topArticles":[{"title":"Get started","url":"https://www.apollographql.com/docs/studio/getting-started/"},{"title":"Metrics reporting","url":"https://www.apollographql.com/docs/studio/setup-analytics/"},{"title":"Schema checks","url":"https://www.apollographql.com/docs/studio/schema-checks/"}]},"Rover CLI":{"docset":"rover","category":"Tools","url":"https://www.apollographql.com/docs/rover","description":"Manage your Studio graphs and schemas from the command line.","topArticles":[{"title":"Install","url":"https://www.apollographql.com/docs/rover/getting-started"},{"title":"Configure","url":"https://www.apollographql.com/docs/rover/configuring/"},{"title":"Working with graphs","url":"https://www.apollographql.com/docs/rover/graphs/"}]}},"footerNavConfig":{"Forums":{"href":"https://community.apollographql.com/","target":"_blank","rel":"noopener noreferrer"},"Blog":{"href":"https://blog.apollographql.com/","target":"_blank","rel":"noopener noreferrer"},"Contribute":{"href":"https://www.apollographql.com/docs/community/"},"Summit":{"href":"https://summit.graphql.com/","target":"_blank","rel":"noopener noreferrer"}},"ffWidgetId":"3131c43c-bfb5-44e6-9a72-b4094f7ec028","shareImageConfig":{"titleFont":"Source%20Sans%20Pro","titleFontSize":80,"titleExtraConfig":"_bold","taglineFont":"Source%20Sans%20Pro","textColor":"FFFFFF","textLeftOffset":80,"textAreaWidth":1120,"cloudName":"apollographql","imagePublicID":"apollo-docs-template2_dohzxt"},"oneTrust":true,"root":"/Users/shanemyrick/src/github/apollographql/apollo-server/docs","pathPrefix":"/docs/apollo-server","algoliaIndexName":"server","algoliaFilters":["docset:server",["docset:react","docset:federation"]],"subtitle":"Apollo Server","description":"A guide to using Apollo Server","githubRepo":"apollographql/apollo-server","defaultVersion":"3","remarkTypescriptOptions":{"throwOnError":true,"prettierOptions":{"trailingComma":"all","singleQuote":true}},"versions":{"2":"version-2"},"sidebarCategories":{"null":["index","getting-started","integrations/middleware","[Apollo Federation](https://www.apollographql.com/docs/federation/)"],"New in v3":["migration","[Changelog](https://github.com/apollographql/apollo-server/blob/main/CHANGELOG.md)"],"Defining a Schema":["schema/schema","schema/unions-interfaces","schema/custom-scalars","schema/directives","schema/creating-directives"],"Fetching Data":["data/resolvers","data/data-sources","data/errors","data/file-uploads","data/subscriptions"],"Development Workflow":["testing/build-run-queries","requests","testing/mocking","testing/testing","[Apollo Studio Explorer](https://www.apollographql.com/docs/studio/explorer/)"],"Performance":["performance/caching","performance/apq"],"Security":["security/authentication","security/terminating-ssl","proxy-configuration"],"Deployment":["deployment/heroku","deployment/lambda","deployment/azure-functions","deployment/gcp-functions"],"Monitoring":["monitoring/metrics","monitoring/health-checks"],"API Reference":["api/apollo-server","[@apollo/federation](https://www.apollographql.com/docs/federation/api/apollo-federation/)","[@apollo/gateway](https://www.apollographql.com/docs/federation/api/apollo-gateway/)"],"Built-in Plugins":["builtin-plugins","api/plugin/usage-reporting","api/plugin/schema-reporting","api/plugin/inline-trace","api/plugin/drain-http-server","api/plugin/cache-control","api/plugin/landing-pages"],"Custom Plugins":["integrations/plugins","integrations/plugins-event-reference"]}},
    }]
/* global plugins */
// During bootstrap, we write requires at top of this file which looks like:
// var plugins = [
//   {
//     plugin: require("/path/to/plugin1/gatsby-ssr.js"),
//     options: { ... },
//   },
//   {
//     plugin: require("/path/to/plugin2/gatsby-ssr.js"),
//     options: { ... },
//   },
// ]

const apis = require(`./api-ssr-docs`)

function augmentErrorWithPlugin(plugin, err) {
  if (plugin.name !== `default-site-plugin`) {
    // default-site-plugin is user code and will print proper stack trace,
    // so no point in annotating error message pointing out which plugin is root of the problem
    err.message += ` (from plugin: ${plugin.name})`
  }

  throw err
}

export function apiRunner(api, args, defaultReturn, argTransform) {
  if (!apis[api]) {
    console.log(`This API doesn't exist`, api)
  }

  const results = []
  plugins.forEach(plugin => {
    const apiFn = plugin.plugin[api]
    if (!apiFn) {
      return
    }

    try {
      const result = apiFn(args, plugin.options)

      if (result && argTransform) {
        args = argTransform({ args, result })
      }

      // This if case keeps behaviour as before, we should allow undefined here as the api is defined
      // TODO V4
      if (typeof result !== `undefined`) {
        results.push(result)
      }
    } catch (e) {
      augmentErrorWithPlugin(plugin, e)
    }
  })

  return results.length ? results : [defaultReturn]
}

export async function apiRunnerAsync(api, args, defaultReturn, argTransform) {
  if (!apis[api]) {
    console.log(`This API doesn't exist`, api)
  }

  const results = []
  for (const plugin of plugins) {
    const apiFn = plugin.plugin[api]
    if (!apiFn) {
      continue
    }

    try {
      const result = await apiFn(args, plugin.options)

      if (result && argTransform) {
        args = argTransform({ args, result })
      }

      // This if case keeps behaviour as before, we should allow undefined here as the api is defined
      // TODO V4
      if (typeof result !== `undefined`) {
        results.push(result)
      }
    } catch (e) {
      augmentErrorWithPlugin(plugin, e)
    }
  }

  return results.length ? results : [defaultReturn]
}
