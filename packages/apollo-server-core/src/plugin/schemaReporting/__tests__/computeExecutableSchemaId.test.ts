import { computeExecutableSchemaId } from '..';
import { printSchema, buildSchema } from 'graphql';

describe('Executable Schema Id', () => {
  const unsortedGQLSchemaDocument = `
      directive @example on FIELD
      union AccountOrUser = Account | User
      type Query {
        userOrAccount(name: String, id: String): AccountOrUser
      }

      type User {
        accounts: [Account!]
        email: String
        name: String!
      }

      type Account {
        name: String!
        id: ID!
      }
    `;

  const sortedGQLSchemaDocument = `
      directive @example on FIELD
      union AccountOrUser = Account | User

      type Account {
        name: String!
        id: ID!
      }

      type Query {
        userOrAccount(id: String, name: String): AccountOrUser
      }

      type User {
        accounts: [Account!]
        email: String
        name: String!
      }

    `;
  it('does not normalize GraphQL schemas', () => {
    // This test made a bit more sense back when computeExecutableSchemaId could take
    // a GraphQLSchema directly, but maybe it's still vaguely helpful.
    expect(
      computeExecutableSchemaId(
        printSchema(buildSchema(unsortedGQLSchemaDocument)),
      ),
    ).not.toEqual(
      computeExecutableSchemaId(
        printSchema(buildSchema(sortedGQLSchemaDocument)),
      ),
    );
  });
  it('does not normalize strings', () => {
    expect(computeExecutableSchemaId(unsortedGQLSchemaDocument)).not.toEqual(
      computeExecutableSchemaId(sortedGQLSchemaDocument),
    );
  });
});
