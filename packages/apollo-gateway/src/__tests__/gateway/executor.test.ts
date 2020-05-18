import gql from 'graphql-tag';
import { ApolloGateway } from '../../';
import { fixtures } from '../__fixtures__/schemas/';
import { ApolloServer } from "apollo-server";

describe('ApolloGateway executor', () => {
  it('validates requests prior to execution', async () => {
    const gateway = new ApolloGateway({
      localServiceList: fixtures,
    });

    const { executor } = await gateway.load();

    const { errors } = await executor({
      document: gql`
        query InvalidVariables($first: Int!) {
          topReviews(first: $first) {
            body
          }
        }
      `,
      request: {
        variables: { first: '3' },
      },
      queryHash: 'hashed',
      context: null,
      cache: {} as any,
    });

    expect(errors![0].message).toMatch(
      'Variable "$first" got invalid value "3"; Expected type Int.',
    );
  });

  it('still sets the ApolloServer executor on load rejection', async () => {
    jest.spyOn(console, 'error').mockImplementation();

    const gateway = new ApolloGateway({
      // Empty service list will throw, which is what we want.
      serviceList: [],
    });

    const server = new ApolloServer({
      gateway,
      subscriptions: false,
    });

    // Ensure the throw happens to maintain the correctness of this test.
    await expect(
      server.executeOperation({ query: '{ __typename }' })).rejects.toThrow();

    expect(server.requestOptions.executor).toBe(gateway.executor);
  });
});
