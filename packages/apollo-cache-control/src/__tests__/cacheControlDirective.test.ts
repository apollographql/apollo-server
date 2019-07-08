import { buildSchemaWithCacheControlSupport } from './cacheControlSupport';

import { CacheScope } from '../';
import { collectCacheControlHints } from './collectCacheControlHints';

describe('@cacheControl directives', () => {
  it('should set maxAge: 0 and no scope for a field without cache hints', async () => {
    const schema = buildSchemaWithCacheControlSupport(`
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

  it('should set maxAge: 0 and no scope for a top-level scalar field without cache hints', async () => {
    const schema = buildSchemaWithCacheControlSupport(`
      type Query {
        name: String
      }
    `);

    const hints = await collectCacheControlHints(
      schema,
      `
        query {
          name
        }
      `,
    );

    expect(hints).toContainEqual({ path: ['name'], maxAge: 0 });
  });

  it('should set maxAge to the default and no scope for a field without cache hints', async () => {
    const schema = buildSchemaWithCacheControlSupport(`
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
    const schema = buildSchemaWithCacheControlSupport(`
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
    const schema = buildSchemaWithCacheControlSupport(`
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
    const schema = buildSchemaWithCacheControlSupport(`
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
    const schema = buildSchemaWithCacheControlSupport(`
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
    const schema = buildSchemaWithCacheControlSupport(`
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
    const schema = buildSchemaWithCacheControlSupport(`
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
});
