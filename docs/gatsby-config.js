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
            'graphql-playground',
            '[Changelog](https://github.com/apollographql/apollo-server/blob/master/CHANGELOG.md)',
          ],
          'Defining a Schema': [
            'schema/schema',
            'schema/scalars-enums',
            'schema/unions-interfaces',
            'schema/directives',
            'schema/creating-directives',
          ],
          'Serving Requests': [
            'serving/data',
            'serving/data-sources',
            'serving/errors',
            'serving/authentication',
            'serving/file-uploads',
            'serving/subscriptions',
          ],
          Testing: [
            'testing-and-monitoring/mocking',
            'testing-and-monitoring/testing',
          ],
          'Improving Performance': ['performance/caching', 'performance/apq'],
          Deployment: [
            'deployment/heroku',
            'deployment/lambda',
            'deployment/now',
            'deployment/netlify',
            'deployment/azure-functions',
          ],
          Monitoring: [
            'testing-and-monitoring/metrics',
            'testing-and-monitoring/health-checks',
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
