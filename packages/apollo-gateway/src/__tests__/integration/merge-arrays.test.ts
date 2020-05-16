import { execute } from '../execution-utils';

describe('query', () => {
  it('supports arrays', async () => {
    const query = `#graphql
      query MergeArrays {
        me {
          # goodAddress
          goodDescription
          metadata {
            address
          }
        }
      }
    `;

    const { data, queryPlan } = await execute({
      query,
    });

    expect(data).toEqual({
      me: {
        goodDescription: true,
        metadata: [
          {
            address: '1',
          },
        ],
      },
    });

    expect(queryPlan).toCallService('accounts');
  });
});
