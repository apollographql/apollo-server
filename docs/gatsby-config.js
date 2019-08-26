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
        defaultVersion: 2,
        versions: {
          1: 'version-1',
        },
        sidebarCategories: {
          null: [
            'index',
            'getting-started',
            '[Changelog](https://github.com/apollographql/apollo-server/blob/master/CHANGELOG.md)',
          ],
          'Defining a Schema': [
            'essentials/schema',
            'features/scalars-enums',
            'features/unions-interfaces',
            'features/directives',
            'features/creating-directives',
          ],
          'Resolving Requests': [
            'essentials/data',
            'features/data-sources',
            'features/errors',
            'features/authentication',
            'features/file-uploads',
            'features/subscriptions',
          ],
          'Testing & Monitoring': [
            'features/mocking',
            'features/graphql-playground',
            'features/testing',
            'features/metrics',
            'features/health-checks',
          ],
          'Improving Performance': ['features/caching', 'features/apq'],
          Deployment: [
            'deployment/heroku',
            'deployment/lambda',
            'deployment/now',
            'deployment/netlify',
            'deployment/azure-functions',
          ],
          Federation: [
            'federation/introduction',
            'federation/concerns',
            'federation/core-concepts',
            'federation/implementing',
            'federation/advanced-features',
            'federation/errors',
            'federation/migrating-from-stitching',
            'federation/federation-spec',
            'federation/metrics',
          ],
          'API Reference': [
            'api/apollo-server',
            'api/apollo-federation',
            'api/apollo-gateway',
            'api/graphql-tools',
          ],
          Migration: [
            'migration-two-dot',
            'migration-engine',
            'migration-file-uploads',
          ],
        },
      },
    },
  ],
};
