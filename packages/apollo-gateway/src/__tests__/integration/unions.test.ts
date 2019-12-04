import gql from 'graphql-tag';
import { astSerializer, queryPlanSerializer } from '../../snapshotSerializers';
import { execute } from '../execution-utils';

expect.addSnapshotSerializer(astSerializer);
expect.addSnapshotSerializer(queryPlanSerializer);

it('handles multiple union type conditions', async () => {
  const query = gql`
    query {
      union {
        ...Foo
        ...Bar
      }
    }

    fragment Foo on Foo {
      nested {
        thing
      }
    }

    fragment Bar on Bar {
      nested {
        stuff
      }
    }
  `;

  const { data, queryPlan, errors } = await execute(
    [
      {
        name: 'unionService',
        typeDefs: gql`
          extend type Query {
            union: MyUnion
          }

          union MyUnion = Foo | Bar

          type Foo {
            nested: Thing
          }

          type Thing {
            thing: String
          }

          type Bar {
            nested: Stuff
          }

          type Stuff {
            stuff: String
          }
        `,
        resolvers: {
          Query: {},
        },
      },
    ],
    { query },
  );

  expect(data).toMatchInlineSnapshot(`
    Object {
      "union": null,
    }
  `);
  expect(queryPlan).toMatchInlineSnapshot(`
    QueryPlan {
      Fetch(service: "unionService") {
        {
          union {
            __typename
            ... on Foo {
              nested {
                thing
                stuff
              }
            }
            ... on Bar {
              nested {
                thing
                stuff
              }
            }
          }
        }
      },
    }
  `);

  expect(errors).toMatchInlineSnapshot(`
    Array [
      [GraphQLError: Cannot query field "stuff" on type "Thing".],
      [GraphQLError: Cannot query field "thing" on type "Stuff".],
    ]
  `);
});
