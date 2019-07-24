import gql from 'graphql-tag';
import { execute, overrideResolversInService } from '../execution-utils';

const accounts = {
  name: 'accounts',
  typeDefs: gql`
    type User @key(fields: "id") {
      id: Int!
      name: String
      account: Account
    }
    type Account {
      type: String
    }
    extend type Query {
      me: User
    }
  `,
  resolvers: {
    Query: {
      me: () => ({ id: 1, name: 'Martijn' }),
    },
  },
};

it('executes a query plan over concrete types', async () => {
  const me = jest.fn(() => ({ id: 1, name: 'James' }));
  const localAccounts = overrideResolversInService(accounts, {
    Query: { me },
  });

  const query = gql`
    query GetUser {
      me {
        id
        name
      }
    }
  `;
  const { data, queryPlan } = await execute([localAccounts], {
    query,
  });

  expect(data).toEqual({ me: { id: 1, name: 'James' } });
  expect(queryPlan).toCallService('accounts');
  expect(me).toBeCalled();
});

it('does not remove __typename on root types', async () => {
  const query = gql`
    query GetUser {
      __typename
    }
  `;

  const { data } = await execute([accounts], {
    query,
  });

  expect(data).toEqual({ __typename: 'Query' });
});

it('does not remove __typename if that is all that is requested on an entity', async () => {
  const me = jest.fn(() => ({ id: 1, name: 'James' }));
  const localAccounts = overrideResolversInService(accounts, {
    Query: { me },
  });

  const query = gql`
    query GetUser {
      me {
        __typename
      }
    }
  `;
  const { data, queryPlan } = await execute([localAccounts], {
    query,
  });

  expect(data).toEqual({ me: { __typename: 'User' } });
  expect(queryPlan).toCallService('accounts');
  expect(me).toBeCalled();
});

it('does not remove __typename if that is all that is requested on a value type', async () => {
  const me = jest.fn(() => ({ id: 1, name: 'James', account: {} }));
  const localAccounts = overrideResolversInService(accounts, {
    Query: { me },
  });

  const query = gql`
    query GetUser {
      me {
        account {
          __typename
        }
      }
    }
  `;
  const { data, queryPlan } = await execute([localAccounts], {
    query,
  });

  expect(data).toEqual({ me: { account: { __typename: 'Account' } } });
  expect(queryPlan).toCallService('accounts');
  expect(me).toBeCalled();
});
