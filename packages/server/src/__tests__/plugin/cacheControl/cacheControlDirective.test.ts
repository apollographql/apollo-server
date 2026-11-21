import {
  buildSchemaWithCacheControlSupport,
  makeExecutableSchemaWithCacheControlSupport,
} from './cacheControlSupport';

import {
  collectCacheControlHints,
  collectCacheControlHintsAndPolicyIfCacheable,
} from './collectCacheControlHints';
import { describe, it, expect } from '@jest/globals';

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

    expect(hints).toStrictEqual(new Map([['droid', { maxAge: 0 }]]));
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

    expect(hints).toStrictEqual(new Map([['name', { maxAge: 0 }]]));
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

    expect(hints).toStrictEqual(new Map([['droid', { maxAge: 10 }]]));
  });

  it('should set the specified maxAge from a cache hint on the field', async () => {
    const schema = buildSchemaWithCacheControlSupport(`
      type Query {
        droid(id: ID!): Droid @cacheControl(maxAge: 60, scope: PUBLIC)
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

    expect(hints).toStrictEqual(
      new Map([['droid', { maxAge: 60, scope: 'PUBLIC' }]]),
    );
  });

  it('should set the specified maxAge for a field from a cache hint on the target type', async () => {
    const schema = buildSchemaWithCacheControlSupport(`
      type Query {
        droid(id: ID!): Droid
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

    expect(hints).toStrictEqual(
      new Map([['droid', { maxAge: 60, scope: 'PUBLIC' }]]),
    );
  });

  it('should set the specified maxAge for a field from a cache hint on the target type extension', async () => {
    const schema = buildSchemaWithCacheControlSupport(`
      type Query {
        droid(id: ID!): Droid
      }

      type Droid {
        id: ID!
        name: String!
      }

      extend type Droid @cacheControl(maxAge: 60, scope: PUBLIC)
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

    expect(hints).toStrictEqual(
      new Map([['droid', { maxAge: 60, scope: 'PUBLIC' }]]),
    );
  });

  it('should overwrite the default maxAge when maxAge=0 is specified on the type', async () => {
    const schema = buildSchemaWithCacheControlSupport(`
      type Query {
        droid(id: ID!): Droid
      }

      type Droid @cacheControl(maxAge: 0, scope: PUBLIC) {
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

    expect(hints).toStrictEqual(
      new Map([['droid', { maxAge: 0, scope: 'PUBLIC' }]]),
    );
  });

  it('should override the maxAge from the target type with that specified on a field', async () => {
    const schema = buildSchemaWithCacheControlSupport(`
      type Query {
        droid(id: ID!): Droid @cacheControl(maxAge: 120, scope: PUBLIC)
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

    expect(hints).toStrictEqual(
      new Map([['droid', { maxAge: 120, scope: 'PUBLIC' }]]),
    );
  });

  it('should override the maxAge from the target type with that specified on a field, keeping the scope', async () => {
    const schema = buildSchemaWithCacheControlSupport(`
      type Query {
        droid(id: ID!): Droid @cacheControl(maxAge: 120, scope: PRIVATE)
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

    expect(hints).toStrictEqual(
      new Map([['droid', { maxAge: 120, scope: 'PRIVATE' }]]),
    );
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

    expect(hints).toStrictEqual(
      new Map([['droid', { maxAge: 60, scope: 'PRIVATE' }]]),
    );
  });

  it('interaction between type implementing interface, both with specified `maxAge`', async () => {
    const schema = buildSchemaWithCacheControlSupport(`
      type Query {
        named: Named
        droid(id: ID!): Droid
        alien(id: ID!): Alien
      }

      interface Named @cacheControl(maxAge: 60, scope: PUBLIC) {
        name: String!
      }

      type Droid implements Named @cacheControl(maxAge: 30, scope: PUBLIC) {
        id: ID!
        name: String!
      }

      type Alien implements Named {
        id: ID!
        name: String!
      }
    `);

    const hintsNamed = await collectCacheControlHints(
      schema,
      `
        query {
          named {
            ... on Droid {
              id
              name
            }
          }
        }
      `,
    );

    expect(hintsNamed).toStrictEqual(
      new Map([['named', { maxAge: 60, scope: 'PUBLIC' }]]),
    );

    const hintsDroid = await collectCacheControlHints(
      schema,
      `
        query {
          droid(id: 2001) {
            id
            name
          }
        }
      `,
    );

    expect(hintsDroid).toStrictEqual(
      new Map([['droid', { maxAge: 30, scope: 'PUBLIC' }]]),
    );

    const hintsAlien = await collectCacheControlHints(
      schema,
      `
        query {
          alien(id: 3001) {
            id
            name
          }
        }
      `,
      { defaultMaxAge: 10 },
    );

    expect(hintsAlien).toStrictEqual(
      new Map([['alien', { maxAge: 10, scope: undefined }]]),
    );
  });

  it('inheritMaxAge', async () => {
    const schema = makeExecutableSchemaWithCacheControlSupport({
      typeDefs: `#graphql
      type Query {
        topLevel: DroidQuery @cacheControl(maxAge: 1000, scope: PUBLIC)
      }

      type DroidQuery {
        droid: Droid @cacheControl(inheritMaxAge: true, scope: PUBLIC)
        droids: [Droid] @cacheControl(inheritMaxAge: true, scope: PUBLIC)
      }

      type Droid {
        uncachedField: Droid
        scalarField: String
        cachedField: String @cacheControl(maxAge: 30, scope: PUBLIC)
      }
    `,
    });

    {
      const { hints, policyIfCacheable } =
        await collectCacheControlHintsAndPolicyIfCacheable(
          schema,
          '{ topLevel { droid { cachedField } } }',
          {},
        );

      expect(hints).toStrictEqual(
        new Map([
          ['topLevel', { maxAge: 1000, scope: 'PUBLIC' }],
          ['topLevel.droid', { maxAge: undefined, scope: 'PUBLIC' }],
          ['topLevel.droid.cachedField', { maxAge: 30, scope: 'PUBLIC' }],
        ]),
      );
      expect(policyIfCacheable).toStrictEqual({
        maxAge: 30,
        scope: 'PUBLIC',
      });
    }

    {
      const { hints, policyIfCacheable } =
        await collectCacheControlHintsAndPolicyIfCacheable(
          schema,
          '{ topLevel { droid { uncachedField { cachedField } cachedField } } }',
          {},
        );

      expect(hints).toStrictEqual(
        new Map([
          ['topLevel', { maxAge: 1000, scope: 'PUBLIC' }],
          ['topLevel.droid', { maxAge: undefined, scope: 'PUBLIC' }],
          ['topLevel.droid.cachedField', { maxAge: 30, scope: 'PUBLIC' }],
          ['topLevel.droid.uncachedField', { maxAge: 0 }],
          [
            'topLevel.droid.uncachedField.cachedField',
            { maxAge: 30, scope: 'PUBLIC' },
          ],
        ]),
      );
      expect(policyIfCacheable).toBeNull();
    }

    {
      const { hints, policyIfCacheable } =
        await collectCacheControlHintsAndPolicyIfCacheable(
          schema,
          '{ topLevel { droids { uncachedField { cachedField } cachedField } } }',
          {},
        );

      expect(hints).toStrictEqual(
        new Map([
          ['topLevel', { maxAge: 1000, scope: 'PUBLIC' }],
          ['topLevel.droids', { maxAge: undefined, scope: 'PUBLIC' }],
          ['topLevel.droids.0.cachedField', { maxAge: 30, scope: 'PUBLIC' }],
          ['topLevel.droids.0.uncachedField', { maxAge: 0 }],
          [
            'topLevel.droids.0.uncachedField.cachedField',
            { maxAge: 30, scope: 'PUBLIC' },
          ],
          ['topLevel.droids.1.cachedField', { maxAge: 30, scope: 'PUBLIC' }],
          ['topLevel.droids.1.uncachedField', { maxAge: 0 }],
          [
            'topLevel.droids.1.uncachedField.cachedField',
            { maxAge: 30, scope: 'PUBLIC' },
          ],
        ]),
      );
      expect(policyIfCacheable).toBeNull();
    }
  });

  it('inheritMaxAge docs examples', async () => {
    const schema = makeExecutableSchemaWithCacheControlSupport({
      typeDefs: `#graphql
        type Query {
          book: Book
          cachedBook: Book @cacheControl(maxAge: 60, scope: PUBLIC)
          reader: Reader @cacheControl(maxAge: 40, scope: PUBLIC)
        }
        type Book {
          title: String
          cachedTitle: String @cacheControl(maxAge: 30, scope: PUBLIC)
        }
        type Reader {
          book: Book @cacheControl(inheritMaxAge: true, scope: PUBLIC)
        }
      `,
    });

    async function expectMaxAge(operation: string, maxAge: number | undefined) {
      expect(
        (
          await collectCacheControlHintsAndPolicyIfCacheable(
            schema,
            operation,
            {},
          )
        ).policyIfCacheable?.maxAge,
      ).toBe(maxAge);
    }

    await expectMaxAge('{book{cachedTitle}}', undefined);
    await expectMaxAge('{cachedBook{title}}', 60);
    await expectMaxAge('{cachedBook{cachedTitle}}', 30);
    await expectMaxAge('{reader{book{title}}}', 40);
  });

  it('inheritMaxAge can be combined with scope', async () => {
    const schema = makeExecutableSchemaWithCacheControlSupport({
      typeDefs: `#graphql
        type Query {
          topLevel: TopLevel @cacheControl(maxAge: 500, scope: PUBLIC)
        }
        type TopLevel {
          foo: Foo @cacheControl(inheritMaxAge: true, scope: PRIVATE)
        }
        type Foo {
          bar: String @cacheControl(maxAge: 5, scope: PUBLIC)
        }
    `,
    });

    const { hints, policyIfCacheable } =
      await collectCacheControlHintsAndPolicyIfCacheable(
        schema,
        '{topLevel { foo { bar } } }',
        {},
      );

    expect(hints).toStrictEqual(
      new Map([
        ['topLevel', { maxAge: 500, scope: 'PUBLIC' }],
        ['topLevel.foo', { maxAge: undefined, scope: 'PRIVATE' }],
        ['topLevel.foo.bar', { maxAge: 5, scope: 'PUBLIC' }],
      ]),
    );
    expect(policyIfCacheable).toStrictEqual({
      maxAge: 5,
      scope: 'PRIVATE',
    });
  });

  it('inheritMaxAge on types', async () => {
    const schema = makeExecutableSchemaWithCacheControlSupport({
      typeDefs: `#graphql
        type Query {
          topLevel: TopLevel @cacheControl(maxAge: 500, scope: PUBLIC)
        }
        type TopLevel {
          foo: Foo
        }
        type Foo @cacheControl(inheritMaxAge: true, scope: PUBLIC) {
          bar: String
        }
    `,
    });

    const { hints, policyIfCacheable } =
      await collectCacheControlHintsAndPolicyIfCacheable(
        schema,
        '{topLevel { foo { bar } } }',
        {},
      );

    expect(hints).toStrictEqual(
      new Map([
        ['topLevel', { maxAge: 500, scope: 'PUBLIC' }],
        ['topLevel.foo', { maxAge: undefined, scope: 'PUBLIC' }],
      ]),
    );
    expect(policyIfCacheable).toStrictEqual({
      maxAge: 500,
      scope: 'PUBLIC',
    });
  });

  it('scalars can inherit from grandparents', async () => {
    const schema = makeExecutableSchemaWithCacheControlSupport({
      typeDefs: `#graphql
        type Query {
          foo: Foo @cacheControl(maxAge: 5, scope: PUBLIC)
        }
        type Foo {
          bar: Bar @cacheControl(inheritMaxAge: true, scope: PUBLIC)
          defaultBar: Bar
        }
        type Bar {
          scalar: String
          cachedScalar: String @cacheControl(maxAge: 2, scope: PUBLIC)
        }
    `,
    });

    async function expectMaxAge(operation: string, maxAge: number | undefined) {
      expect(
        (
          await collectCacheControlHintsAndPolicyIfCacheable(
            schema,
            operation,
            {},
          )
        ).policyIfCacheable?.maxAge,
      ).toBe(maxAge);
    }

    await expectMaxAge('{foo{defaultBar{scalar}}}', undefined);
    await expectMaxAge('{foo{defaultBar{cachedScalar}}}', undefined);
    await expectMaxAge('{foo{bar{scalar}}}', 5);
    await expectMaxAge('{foo{bar{cachedScalar}}}', 2);
  });
});
