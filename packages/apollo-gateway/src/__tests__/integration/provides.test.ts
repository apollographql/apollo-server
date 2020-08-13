import { execute, overrideResolversInService } from '../execution-utils';
import { fixtures } from 'apollo-federation-integration-testsuite';

it('does not have to go to another service when field is given', async () => {
  const query = `#graphql
    query GetReviewers {
      topReviews {
        author {
          username
        }
      }
    }
  `;

  const { data, queryPlan } = await execute( {
    query,
  });

  expect(data).toEqual({
    topReviews: [
      { author: { username: '@ada' } },
      { author: { username: '@ada' } },
      { author: { username: '@complete' } },
      { author: { username: '@complete' } },
      { author: { username: '@complete' } },
    ],
  });

  expect(queryPlan).not.toCallService('accounts');
  expect(queryPlan).toCallService('reviews');
});

it('does not load fields provided even when going to other service', async () => {
  const [accounts, ...restFixtures] = fixtures;

  const username = jest.fn();
  const localAccounts = overrideResolversInService(accounts, {
    User: {
      username,
    },
  });

  const query = `#graphql
    query GetReviewers {
      topReviews {
        author {
          username
          name
        }
      }
    }
  `;

  const { data, queryPlan } = await execute(
    {
      query,
    },
    [localAccounts, ...restFixtures],
  );

  expect(data).toEqual({
    topReviews: [
      { author: { username: '@ada', name: 'Ada Lovelace' } },
      { author: { username: '@ada', name: 'Ada Lovelace' } },
      { author: { username: '@complete', name: 'Alan Turing' } },
      { author: { username: '@complete', name: 'Alan Turing' } },
      { author: { username: '@complete', name: 'Alan Turing' } },
    ],
  });

  expect(username).not.toHaveBeenCalled();
  expect(queryPlan).toCallService('accounts');
  expect(queryPlan).toCallService('reviews');
});
