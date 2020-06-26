import { execute } from '../execution-utils';

describe('query', () => {
  it('supports parallel root fields', async () => {
    const query = `#graphql
      query GetUserAndReviews {
        me {
          username
        }
        topReviews {
          body
        }
      }
    `;

    const { data, queryPlan } = await execute({
      query,
    });

    expect(data).toEqual({
      me: { username: '@ada' },
      topReviews: [
        { body: 'Love it!' },
        { body: 'Too expensive.' },
        { body: 'Could be better.' },
        { body: 'Prefer something else.' },
        { body: 'Wish I had read this before.' },
      ],
    });

    expect(queryPlan).toCallService('accounts');
    expect(queryPlan).toCallService('reviews');
    // FIXME: determine matcher for execution order
  });
});
