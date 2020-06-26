import gql from 'graphql-tag';
import { astSerializer, queryPlanSerializer } from '../../snapshotSerializers';
import { execute } from '../execution-utils';

expect.addSnapshotSerializer(astSerializer);
expect.addSnapshotSerializer(queryPlanSerializer);

it('handles multiple union type conditions that share a response name (media)', async () => {
  const query = `#graphql
    query {
      content {
        ...Audio
        ... on Video {
          media {
            aspectRatio
          }
        }
      }
    }
    fragment Audio on Audio {
      media {
        url
      }
    }
  `;

  const { queryPlan, errors } = await execute(
    { query },
    [
      {
        name: 'contentService',
        typeDefs: gql`
          extend type Query {
            content: Content
          }
          union Content = Audio | Video
          type Audio {
            media: AudioURL
          }
          type AudioURL {
            url: String
          }
          type Video {
            media: VideoAspectRatio
          }
          type VideoAspectRatio {
            aspectRatio: String
          }
        `,
        resolvers: {
          Query: {},
        },
      },
    ],
  );

  expect(errors).toBeUndefined();
  expect(queryPlan).toMatchInlineSnapshot(`
    QueryPlan {
      Fetch(service: "contentService") {
        {
          content {
            __typename
            ... on Audio {
              media {
                url
              }
            }
            ... on Video {
              media {
                aspectRatio
              }
            }
          }
        }
      },
    }
  `);
});
