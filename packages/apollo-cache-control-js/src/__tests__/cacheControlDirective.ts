import {
  buildSchema
} from 'graphql';

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
      `
    );

    expect(hints).toContainEqual({ path: ['droid'], maxAge: 0 });
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
      `
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
      `
    );

    expect(hints).toContainEqual({ path: ['droid'], maxAge: 60 });
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
      `
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
      `
    );

    expect(hints).toContainEqual({ path: ['droid'], maxAge: 120, scope: CacheScope.Private });
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
      `
    );

    expect(hints).toContainEqual({ path: ['droid'], maxAge: 60, scope: CacheScope.Private });
  });
});
