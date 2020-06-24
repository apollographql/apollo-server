const themeOptions = require('gatsby-theme-apollo-docs/theme-options');

module.exports = {
  pathPrefix: '/docs/apollo-server',
  plugins: [
    {
      resolve: 'gatsby-theme-apollo-docs',
      options: {
        ...themeOptions,
        root: __dirname,
        subtitle: 'Apollo Server',
        description: 'A guide to using Apollo Server',
        githubRepo: 'apollographql/apollo-server',
        defaultVersion: '2',
        versions: {
          '1': 'version-1',
        },
        sidebarCategories: {
          null: [
            'index',
            'getting-started',
            '[Changelog](https://github.com/apollographql/apollo-server/blob/main/CHANGELOG.md)',
          ],
          'Defining a Schema': [
            'schema/schema',
            'schema/scalars-enums',
            'schema/unions-interfaces',
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
          'Apollo Federation': [
            'federation/introduction',
            'federation/implementing-services',
            'federation/gateway',
            'federation/entities',
            'federation/value-types',
            'federation/errors',
            'federation/metrics',
            'federation/migrating-from-stitching',
            'federation/other-servers',
            'federation/federation-spec',
          ],
          Testing: ['testing/mocking', 'testing/testing', 'testing/graphql-playground'],
          Performance: ['performance/caching', 'performance/apq'],
          Security: ['security/authentication', 'security/terminating-ssl'],
          Integrations: [
            'integrations/middleware',
            'integrations/plugins',
          ],
          Deployment: [
            'deployment/heroku',
            'deployment/lambda',
            'deployment/netlify',
            'deployment/azure-functions',
          ],
          Monitoring: ['monitoring/metrics', 'monitoring/health-checks'],
          'API Reference': [
            'api/apollo-server',
            'api/apollo-federation',
            'api/apollo-gateway',
            'api/graphql-tools',
          ],
          Appendices: [
            'proxy-configuration',
            'migration-two-dot',
            'migration-file-uploads',
          ],
        },
      },
    },
  ],
};
