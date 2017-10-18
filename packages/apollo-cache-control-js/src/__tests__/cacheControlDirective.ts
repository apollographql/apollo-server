import {
  buildSchema
} from 'graphql';

import { collectCacheControlData } from './test-utils/helpers';

describe('@cacheControl directives', () => {
  it('should include maxAge: 0 for a root field without cache hints', async () => {
    const schema = buildSchema(`
      type Query {
        droid(id: ID!): Droid
      }

      type Droid {
        id: ID!
        name: String!
      }
    `);

    const data = await collectCacheControlData(
      schema,
      `
        query {
          droid(id: 2001) {
            name
          }
        }
      `
    );

    expect(data.hints).toContainEqual({ path: ['droid'], maxAge: 0 });
  });

  it('should include the specified maxAge for a root field with a cache hint', async () => {
    const schema = buildSchema(`
      type Query {
        droid(id: ID!): Droid @cacheControl(maxAge: 60)
      }

      type Droid {
        id: ID!
        name: String!
      }
    `);

    const data = await collectCacheControlData(
      schema,
      `
        query {
          droid(id: 2001) {
            name
          }
        }
      `
    );

    expect(data.hints).toContainEqual({ path: ['droid'], maxAge: 60 });
  });

  it('should include the specified maxAge for a root field with a cache hint on the target type', async () => {
    const schema = buildSchema(`
      type Query {
        droid(id: ID!): Droid
      }

      type Droid @cacheControl(maxAge: 60) {
        id: ID!
        name: String!
      }
    `);

    const data = await collectCacheControlData(
      schema,
      `
        query {
          droid(id: 2001) {
            name
          }
        }
      `
    );

    expect(data.hints).toContainEqual({ path: ['droid'], maxAge: 60 });
  });
});
