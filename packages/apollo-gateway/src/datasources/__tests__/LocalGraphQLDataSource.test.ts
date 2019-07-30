import { LocalGraphQLDataSource } from '../LocalGraphQLDataSource';
import { buildFederatedSchema } from '@apollo/federation';
import gql from 'graphql-tag';

describe('constructing requests', () => {
  it('accepts context', async () => {
    const typeDefs = gql`
      type Query {
        me: User
      }
      type User {
        id: ID
        name: String!
      }
    `;
    const resolvers = {
      Query: {
        me(_, __, { userId }) {
          const users = [
            { id: 1, name: 'otherGuy' },
            { id: 2, name: 'james' },
            {
              id: 3,
              name: 'someoneElse',
            },
          ];
          return users.find(user => user.id === userId);
        },
      },
    };
    const schema = buildFederatedSchema([{ typeDefs, resolvers }]);

    const DataSource = new LocalGraphQLDataSource(schema);

    const { data } = await DataSource.process({
      request: {
        query: '{ me { name } }',
      },
      context: { userId: 2 },
    });

    expect(data).toEqual({ me: { name: 'james' } });
  });
});
