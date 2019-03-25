module.exports = {
  __experimentalThemes: [
    {
      resolve: 'gatsby-theme-apollo-docs',
      options: {
        root: __dirname,
        subtitle: 'Apollo Server',
        description: 'A guide to using Apollo Server',
        contentDir: 'docs/source',
        basePath: '/docs/apollo-server',
        githubRepo: 'apollographql/apollo-server',
        versions: ['1', '2'],
        sidebarCategories: {
          null: [
            'index',
            'getting-started',
            'whats-new'
          ],
          Essentials: [
            'essentials/schema',
            'essentials/server',
            'essentials/data'
          ],
          Features: [
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
            'features/testing'
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
            'deployment/now'
          ],
          'API Reference': [
            'api/apollo-server',
            'api/graphql-tools'
          ],
          Migration: [
            'migration-two-dot',
            'migration-engine',
            'migration-file-uploads'
          ]
        }
      }
    }
  ]
};
