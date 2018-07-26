import { buildSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';

import { CacheScope } from '../';
import { collectCacheControlHints } from './test-utils/helpers';

describe('@cacheControl directives', () => {
  it('should set maxAge: 0 and no scope for a field without cache hints', async () => {
    const schema = buildSchema(`
      type Query {
        droid(id: ID!): Droid
      }

      type Droid {
        id: ID!
        name: String!
      }
    `);

    const hints = await collectCacheControlHints(
      schema,
      `
        query {
          droid(id: 2001) {
            name
          }
        }
      `,
    );

    expect(hints).toContainEqual({ path: ['droid'], maxAge: 0 });
  });

  it('should set maxAge to the default and no scope for a field without cache hints', async () => {
    const schema = buildSchema(`
      type Query {
        droid(id: ID!): Droid
      }

      type Droid {
        id: ID!
        name: String!
      }
    `);

    const hints = await collectCacheControlHints(
      schema,
      `
        query {
          droid(id: 2001) {
            name
          }
        }
      `,
      { defaultMaxAge: 10 },
    );

    expect(hints).toContainEqual({ path: ['droid'], maxAge: 10 });
  });

  it('should set the specified maxAge from a cache hint on the field', async () => {
    const schema = buildSchema(`
      type Query {
        droid(id: ID!): Droid @cacheControl(maxAge: 60)
      }

      type Droid {
        id: ID!
        name: String!
      }
    `);

    const hints = await collectCacheControlHints(
      schema,
      `
        query {
          droid(id: 2001) {
            name
          }
        }
      `,
      { defaultMaxAge: 10 },
    );

    expect(hints).toContainEqual({ path: ['droid'], maxAge: 60 });
  });

  it('should set the specified maxAge for a field from a cache hint on the target type', async () => {
    const schema = buildSchema(`
      type Query {
        droid(id: ID!): Droid
      }

      type Droid @cacheControl(maxAge: 60) {
        id: ID!
        name: String!
      }
    `);

    const hints = await collectCacheControlHints(
      schema,
      `
        query {
          droid(id: 2001) {
            name
          }
        }
      `,
      { defaultMaxAge: 10 },
    );

    expect(hints).toContainEqual({ path: ['droid'], maxAge: 60 });
  });

  it('should overwrite the default maxAge when maxAge=0 is specified on the type', async () => {
    const schema = buildSchema(`
      type Query {
        droid(id: ID!): Droid
      }

      type Droid @cacheControl(maxAge: 0) {
        id: ID!
        name: String!
      }
    `);

    const hints = await collectCacheControlHints(
      schema,
      `
        query {
          droid(id: 2001) {
            name
          }
        }
      `,
      { defaultMaxAge: 10 },
    );

    expect(hints).toContainEqual({ path: ['droid'], maxAge: 0 });
  });

  it('should override the maxAge from the target type with that specified on a field', async () => {
    const schema = buildSchema(`
      type Query {
        droid(id: ID!): Droid @cacheControl(maxAge: 120)
      }

      type Droid @cacheControl(maxAge: 60) {
        id: ID!
        name: String!
      }
    `);

    const hints = await collectCacheControlHints(
      schema,
      `
        query {
          droid(id: 2001) {
            name
          }
        }
      `,
      { defaultMaxAge: 10 },
    );

    expect(hints).toContainEqual({ path: ['droid'], maxAge: 120 });
  });

  it('should override the maxAge from the target type with that specified on a field, keeping the scope', async () => {
    const schema = buildSchema(`
      type Query {
        droid(id: ID!): Droid @cacheControl(maxAge: 120)
      }

      type Droid @cacheControl(maxAge: 60, scope: PRIVATE) {
        id: ID!
        name: String!
      }
    `);

    const hints = await collectCacheControlHints(
      schema,
      `
        query {
          droid(id: 2001) {
            name
          }
        }
      `,
      { defaultMaxAge: 10 },
    );

    expect(hints).toContainEqual({
      path: ['droid'],
      maxAge: 120,
      scope: CacheScope.Private,
    });
  });

  it('should override the scope from the target type with that specified on a field', async () => {
    const schema = buildSchema(`
      type Query {
        droid(id: ID!): Droid @cacheControl(scope: PRIVATE)
      }

      type Droid @cacheControl(maxAge: 60, scope: PUBLIC) {
        id: ID!
        name: String!
      }
    `);

    const hints = await collectCacheControlHints(
      schema,
      `
        query {
          droid(id: 2001) {
            name
          }
        }
      `,
      { defaultMaxAge: 10 },
    );

    expect(hints).toContainEqual({
      path: ['droid'],
      maxAge: 60,
      scope: CacheScope.Private,
    });
  });

  it('should use cache from parent if inherit is true', async () => {
    const typeDefs = `
      type Query {
        droids(page: Int = 0): DroidList @cacheControl(maxAge: 10)
      }

      type DroidList @cacheControl(inherit: true) {
        edges: [DroidEdge!]
      }

      type DroidEdge @cacheControl(inherit: true) {
        node: Droid!
      }

      type Droid @cacheControl(inherit: true) {
        id: ID!
        name: String!
      }
    `;

    const resolvers = {
      Query: {
        droids: (_source, _args, _context, { cacheControl }) => {
          return {
            edges: [{ node: { id: 1 } }],
          };
        },
      },
    };

    const schema = makeExecutableSchema({ typeDefs, resolvers });

    const hints = await collectCacheControlHints(
      schema,
      `
        query {
          droids {
            edges {
              node {
                id
              }
            }
          }
        }
      `,
      { defaultMaxAge: 0 },
    );

    expect(hints).toEqual([{ maxAge: 10, path: ['droids'], scope: undefined }]);
  });

  it('should not use cache from parent if inherit is false', async () => {
    const typeDefs = `
      type Query {
        droids(page: Int = 0): DroidList @cacheControl(maxAge: 10)
      }

      type DroidList @cacheControl(inherit: true) {
        edges: [DroidEdge!]
      }

      type DroidEdge @cacheControl(inherit: false) {
        node: Droid!
      }

      type Droid @cacheControl(inherit: true) {
        id: ID!
        name: String!
      }
    `;

    const resolvers = {
      Query: {
        droids: (_source, _args, _context, { cacheControl }) => {
          return {
            edges: [{ node: { id: 1 } }],
          };
        },
      },
    };

    const schema = makeExecutableSchema({ typeDefs, resolvers });

    const hints = await collectCacheControlHints(
      schema,
      `
        query {
          droids {
            edges {
              node {
                id
              }
            }
          }
        }
      `,
      { defaultMaxAge: 0 },
    );

    expect(hints).toEqual([
      { inherit: undefined, maxAge: 10, path: ['droids'], scope: undefined },
      {
        inherit: false,
        maxAge: 0,
        path: ['droids', 'edges'],
        scope: undefined,
      },
    ]);
  });
});
