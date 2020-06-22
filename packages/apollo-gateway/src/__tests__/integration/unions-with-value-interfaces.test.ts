import gql from 'graphql-tag';
import { astSerializer, queryPlanSerializer } from '../../snapshotSerializers';
import { execute, ServiceDefinitionModule } from '../execution-utils';

expect.addSnapshotSerializer(astSerializer);
expect.addSnapshotSerializer(queryPlanSerializer);

const videos = [{ id: 1, url: 'https://foobar.com/videos/1' }];
const articles = [{ id: 1, url: 'https://foobar.com/articles/1' }];
const audios = [{ id: 1, audioUrl: 'https://foobar.com/audios/1' }];

const contentService: ServiceDefinitionModule = {
  name: 'contentService',
  typeDefs: gql`
    type Query {
      content: [Content!]!
    }
    union Content = Video | Article | Audio
    type Article implements WebResource @key(fields: "id") {
      id: ID
      url: String
    }
    extend type Video @key(fields: "id") {
      id: ID @external
    }
    extend type Audio @key(fields: "id") {
      id: ID @external
    }
    interface WebResource {
      url: String
    }
  `,
  resolvers: {
    Query: {
      content() {
        return [
          ...articles.map((a) => ({...a, type: 'Article'})),
          ...audios.map(({id}) => ({id, type: 'Audio'})),
          ...videos.map(({id}) => ({id, type: 'Video'})),
        ]
      }
    },
    Content: {
      __resolveType(object) {
        return object.type;
      }
    },
    Article: {
      __resolveReference(object) {
        return articles.find(article => article.id === parseInt(object.id, 10));
      },
      id(object) {
        return object.id
      },
      url(object) {
        return object.url;
      }
    },
  },
};

const videoService: ServiceDefinitionModule = {
  name: 'videoService',
  typeDefs: gql`
    interface WebResource {
      url: String
    }
    type Video implements WebResource @key(fields: "id") {
      id: ID
      url: String
    }
  `,
  resolvers: {
    Video: {
      __resolveReference(object) {
        return videos.find(video => video.id === parseInt(object.id, 10));
      },
      id(object) {
        return object.id
      },
      url(object) {
        return object.url;
      }
    },
  },
};

const audioService: ServiceDefinitionModule = {
  name: 'audioService',
  typeDefs: gql`
    type Audio @key(fields: "id") {
      id: ID
      audioUrl: String
    }
  `,
  resolvers: {
    Audio: {
      __resolveReference(object) {
        return audios.find(audio => audio.id === parseInt(object.id, 10));
      },
      id(object) {
        return object.id
      },
      audioUrl(object) {
        return object.audioUrl;
      }
    },
  },
};


it('handles unions from different services which implements value interfaces', async () => {
  const query = `#graphql
    query {
      content {
        ... on WebResource {
          url
        }
        ... on Audio {
          url: audioUrl
        }
      }
    }
  `;

  const { queryPlan, errors, data } = await execute(
    { query },
    [contentService, videoService, audioService],
  );
  expect(errors).toBeUndefined();

  expect(queryPlan).toMatchInlineSnapshot(`
  QueryPlan {
    Sequence {
      Fetch(service: "contentService") {
        {
          content {
            __typename
            ... on WebResource {
              url
            }
            ... on Audio {
              __typename
              id
            }
          }
        }
      },
      Flatten(path: "content.@") {
        Fetch(service: "videoService") {
          {
            ... on Video {
              __typename
              id
            }
          } =>
          {
            ... on WebResource {
              url
            }
          }
        },
      },
      Flatten(path: "content.@") {
        Fetch(service: "audioService") {
          {
            ... on Audio {
              __typename
              id
            }
          } =>
          {
            ... on Audio {
              url: audioUrl
            }
          }
        },
      },
    }
    `);
  expect(data).toEqual({
    content: [
      { url: 'https://foobar.com/articles/1' },
      { url: 'https://foobar.com/audios/1' },
      { url: 'https://foobar.com/videos/1' },
    ]
  });
});
