const themeOptions = require('gatsby-theme-apollo-docs/theme-options');

module.exports = {
  plugins: [
    {
      resolve: 'gatsby-theme-apollo-docs',
      options: {
        ...themeOptions,
        root: __dirname,
        pathPrefix: '/docs/apollo-server',
        algoliaIndexName: 'server',
        subtitle: 'Apollo Server',
        description: 'A guide to using Apollo Server',
        githubRepo: 'apollographql/apollo-server',
        defaultVersion: '3',
        // We build our docs including older versions which are synced from
        // GitHub at build time. If you want to be able to work on docs while
        // offline, set $OFFLINE and we won't include the old versions.
        versions: process.env.OFFLINE
          ? {}
          : {
              2: 'version-2',
            },
        // WATCH OUT: gatsby-theme-apollo-docs does some weird parsing to the source below
        // when loaded as an "old version". eg, you can't put comments in it!
        sidebarCategories: {
          null: [
            'index',
            'getting-started',
            'integrations/middleware',
            '[Apollo Federation](https://www.apollographql.com/docs/federation/)',
          ],
          'New in v3': [
            'migration',
            '[Changelog](https://github.com/apollographql/apollo-server/blob/main/CHANGELOG.md)',
          ],
          'Defining a Schema': [
            'schema/schema',
            'schema/unions-interfaces',
            'schema/custom-scalars',
            'schema/directives',
            'schema/creating-directives',
          ],
          'Fetching Data': [
            'data/resolvers',
            'data/data-sources',
            'data/errors',
            'data/file-uploads',
            'data/subscriptions',
          ],
          'Development Workflow': [
            'testing/build-run-queries',
            'testing/mocking',
            'testing/testing',
            '[Apollo Studio Explorer](https://www.apollographql.com/docs/studio/explorer/)',
          ],
          Performance: ['performance/caching', 'performance/apq'],
          Security: [
            'security/authentication',
            'security/terminating-ssl',
            'proxy-configuration',
          ],
          Deployment: [
            'deployment/heroku',
            'deployment/lambda',
            'deployment/azure-functions',
            'deployment/gcp-functions',
          ],
          Monitoring: ['monitoring/metrics', 'monitoring/health-checks'],
          'API Reference': [
            'api/apollo-server',
            '[@apollo/federation](https://www.apollographql.com/docs/federation/api/apollo-federation/)',
            '[@apollo/gateway](https://www.apollographql.com/docs/federation/api/apollo-gateway/)',
          ],
          'Built-in Plugins': [
            'builtin-plugins',
            'api/plugin/usage-reporting',
            'api/plugin/schema-reporting',
            'api/plugin/inline-trace',
            'api/plugin/cache-control',
            'api/plugin/landing-pages',
          ],
          'Custom Plugins': [
            'integrations/plugins',
            'integrations/plugins-event-reference',
          ],
        },
      },
    },
  ],
};
