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
            'defining-a-schema/schema',
            'defining-a-schema/scalars-enums',
            'defining-a-schema/unions-interfaces',
            'defining-a-schema/directives',
            'defining-a-schema/creating-directives',
          ],
          'Resolving Requests': [
            'resolving-requests/data',
            'resolving-requests/data-sources',
            'resolving-requests/errors',
            'resolving-requests/authentication',
            'resolving-requests/file-uploads',
            'resolving-requests/subscriptions',
          ],
          'Testing & Monitoring': [
            'testing-and-monitoring/mocking',
            'testing-and-monitoring/graphql-playground',
            'testing-and-monitoring/testing',
            'testing-and-monitoring/metrics',
            'testing-and-monitoring/health-checks',
          ],
          'Improving Performance': [
            'improving-performance/caching',
            'improving-performance/apq',
          ],
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
