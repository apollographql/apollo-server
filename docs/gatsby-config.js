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
          null: ['index', 'getting-started', 'whats-new'],
          Essentials: [
            'essentials/schema',
            'essentials/server',
            'essentials/data',
          ],
          Features: [
            'features/caching',
            'features/mocking',
            'features/errors',
            'features/data-sources',
            'features/subscriptions',
            'features/metrics',
            'features/graphql-playground',
            'features/scalars-enums',
            'features/unions-interfaces',
            'features/directives',
            'features/creating-directives',
            'features/authentication',
            'features/testing',
            'features/apq',
            'features/health-checks',
            'features/file-uploads',
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
          // 'Schema stitching': [
          //   'features/schema-stitching',
          //   'features/remote-schemas',
          //   'features/schema-delegation',
          //   'features/schema-transforms',
          // ],
          Deployment: [
            // 'deployment/index',
            'deployment/heroku',
            'deployment/lambda',
            'deployment/now',
            'deployment/netlify',
            'deployment/azure-functions',
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
