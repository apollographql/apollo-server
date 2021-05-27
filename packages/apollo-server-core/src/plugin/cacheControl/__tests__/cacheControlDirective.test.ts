import {
  buildSchemaWithCacheControlSupport,
  makeExecutableSchemaWithCacheControlSupport,
} from './cacheControlSupport';

import { CacheScope } from 'apollo-server-types';
import {
  collectCacheControlHints,
  collectCacheControlHintsAndPolicyIfCacheable,
} from './collectCacheControlHints';

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

    expect(hints).toStrictEqual(new Map([['droid', { maxAge: 60 }]]));
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

    expect(hints).toStrictEqual(new Map([['droid', { maxAge: 60 }]]));
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

      extend type Droid @cacheControl(maxAge: 60)
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

    expect(hints).toStrictEqual(new Map([['droid', { maxAge: 60 }]]));
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

    expect(hints).toStrictEqual(new Map([['droid', { maxAge: 0 }]]));
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

    expect(hints).toStrictEqual(new Map([['droid', { maxAge: 120 }]]));
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

    expect(hints).toStrictEqual(
      new Map([['droid', { maxAge: 120, scope: CacheScope.Private }]]),
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
      new Map([['droid', { maxAge: 60, scope: CacheScope.Private }]]),
    );
  });

  it('noDefaultMaxAge works', async () => {
    const schema = makeExecutableSchemaWithCacheControlSupport({
      typeDefs: `
      type Query {
        droid(setMaxAgeDynamically: Boolean): Droid @cacheControl(noDefaultMaxAge: true)
        droids: [Droid] @cacheControl(noDefaultMaxAge: true)
      }

      type Droid {
        uncachedField: String
        cachedField: String @cacheControl(maxAge: 30)
      }
    `,
      resolvers: {
        Query: {
          droid: (
            _parent,
            { setMaxAgeDynamically },
            _context,
            { cacheControl },
          ) => {
            if (setMaxAgeDynamically) {
              cacheControl.setCacheHint({ maxAge: 60 });
            }
            return {};
          },
          droids: () => [{}, {}],
        },
      },
    });

    {
      const { hints, policyIfCacheable } =
        await collectCacheControlHintsAndPolicyIfCacheable(
          schema,
          '{ droid { cachedField } }',
          {},
        );

      expect(hints).toStrictEqual(
        new Map([['droid.cachedField', { maxAge: 30 }]]),
      );
      expect(policyIfCacheable).toStrictEqual({
        maxAge: 30,
        scope: CacheScope.Public,
      });
    }

    {
      const { hints, policyIfCacheable } =
        await collectCacheControlHintsAndPolicyIfCacheable(
          schema,
          '{ droid { uncachedField cachedField } }',
          {},
        );

      expect(hints).toStrictEqual(
        new Map([
          ['droid.cachedField', { maxAge: 30 }],
          ['droid.uncachedField', { maxAge: 0 }],
        ]),
      );
      expect(policyIfCacheable).toBeNull();
    }

    {
      const { hints, policyIfCacheable } =
        await collectCacheControlHintsAndPolicyIfCacheable(
          schema,
          '{ droid(setMaxAgeDynamically: true) { uncachedField cachedField } }',
          {},
        );

      expect(hints).toStrictEqual(
        new Map([
          ['droid', { maxAge: 60 }],
          ['droid.cachedField', { maxAge: 30 }],
          // We do *not* get a hint on uncachedField because it's a scalar whose
          // parent has a hint, even though that hint was a dynamic hint layered
          // on top of noDefaultMaxAge.
        ]),
      );
      expect(policyIfCacheable).toStrictEqual({
        maxAge: 30,
        scope: CacheScope.Public,
      });
    }

    {
      const { hints, policyIfCacheable } =
        await collectCacheControlHintsAndPolicyIfCacheable(
          schema,
          '{ droids { uncachedField cachedField } }',
          {},
        );

      expect(hints).toStrictEqual(
        new Map([
          ['droids.0.cachedField', { maxAge: 30 }],
          ['droids.0.uncachedField', { maxAge: 0 }],
          ['droids.1.cachedField', { maxAge: 30 }],
          ['droids.1.uncachedField', { maxAge: 0 }],
        ]),
      );
      expect(policyIfCacheable).toBeNull();
    }
  });

  it('noDefaultMaxAge docs examples', async () => {
    const schema = makeExecutableSchemaWithCacheControlSupport({
      typeDefs: `
      type Query {
        foo(setMaxAgeDynamically: Boolean): Foo @cacheControl(noDefaultMaxAge: true)
        intermediate: Intermediate @cacheControl(maxAge: 40)
        defaultFoo: Foo
      }

      type Foo {
        uncachedField: String
        cachedField: String @cacheControl(maxAge: 30)
      }
      type Intermediate {
        foo: Foo @cacheControl(noDefaultMaxAge: true)
      }
    `,
      resolvers: {
        Query: {
          foo: (
            _parent,
            { setMaxAgeDynamically },
            _context,
            { cacheControl },
          ) => {
            if (setMaxAgeDynamically) {
              cacheControl.setCacheHint({ maxAge: 60 });
            }
            return {};
          },
          defaultFoo: () => ({}),
        },
      },
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

    await expectMaxAge('{foo{cachedField}}', 30);
    await expectMaxAge('{foo{uncachedField}}', undefined);
    await expectMaxAge('{defaultFoo{cachedField}}', undefined);
    await expectMaxAge('{foo(setMaxAgeDynamically:true){uncachedField}}', 60);
    await expectMaxAge('{intermediate{foo{uncachedField}}}', 40);
  });

  it('noDefaultMaxAge can be combined with scope', async () => {
    const schema = makeExecutableSchemaWithCacheControlSupport({
      typeDefs: `
        type Query {
          foo: Foo @cacheControl(noDefaultMaxAge: true, scope: PRIVATE)
        }
        type Foo {
          bar: String @cacheControl(maxAge: 5)
        }
    `,
      resolvers: { Query: { foo: () => ({}) } },
    });

    const { hints, policyIfCacheable } =
      await collectCacheControlHintsAndPolicyIfCacheable(
        schema,
        '{ foo { bar } }',
        {},
      );

    expect(hints).toStrictEqual(
      new Map([
        ['foo', { scope: CacheScope.Private }],
        ['foo.bar', { maxAge: 5 }],
      ]),
    );
    expect(policyIfCacheable).toStrictEqual({
      maxAge: 5,
      scope: CacheScope.Private,
    });
  });

  it('scalars can inherit from grandparents', async () => {
    const schema = makeExecutableSchemaWithCacheControlSupport({
      typeDefs: `
        type Query {
          foo: Foo @cacheControl(maxAge: 5)
        }
        type Foo {
          bar: Bar @cacheControl(noDefaultMaxAge: true)
          defaultBar: Bar
        }
        type Bar {
          scalar: String
          cachedScalar: String @cacheControl(maxAge: 2)
        }
    `,
      resolvers: {
        Query: { foo: () => ({}) },
        Foo: { bar: () => ({}), defaultBar: () => ({}) },
      },
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
