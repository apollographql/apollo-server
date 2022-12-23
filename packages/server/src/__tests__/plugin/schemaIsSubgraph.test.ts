import { schemaIsSubgraph } from '../../plugin/schemaIsSubgraph';
import { describe, it, expect } from '@jest/globals';

import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
} from 'graphql';

describe('schemaIsSubgraph', () => {
  it('returns false when there is no service field', async () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'QueryType',
        fields: {
          hello: {
            type: GraphQLString,
          },
        },
      }),
    });

    expect(schemaIsSubgraph(schema)).toBe(false);
  });

  it('returns false when the sdl field is a not string', async () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'QueryType',
        fields: {
          _service: {
            type: new GraphQLObjectType({
              name: '_Service',
              fields: {
                sdl: {
                  type: GraphQLInt,
                },
              },
            }),
          },
        },
      }),
    });

    expect(schemaIsSubgraph(schema)).toBe(false);
  });

  it('returns false when the sdl field is a scalar', async () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'QueryType',
        fields: {
          _service: {
            type: new GraphQLObjectType({
              name: '_Service',
              fields: {
                sdl: {
                  type: new GraphQLObjectType({
                    name: 'Scalar',
                    fields: {
                      value: {
                        type: GraphQLString,
                      },
                    },
                  }),
                },
              },
            }),
          },
        },
      }),
    });

    expect(schemaIsSubgraph(schema)).toBe(false);
  });

  it('returns true when the sdl field is a string', async () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'QueryType',
        fields: {
          _service: {
            type: new GraphQLObjectType({
              name: '_Service',
              fields: {
                sdl: {
                  type: GraphQLString,
                },
              },
            }),
          },
        },
      }),
    });

    expect(schemaIsSubgraph(schema)).toBe(true);
  });

  it('returns true when the sdl field is a non nullable string', async () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'QueryType',
        fields: {
          _service: {
            type: new GraphQLObjectType({
              name: '_Service',
              fields: {
                sdl: {
                  type: new GraphQLNonNull(GraphQLString),
                },
              },
            }),
          },
        },
      }),
    });

    expect(schemaIsSubgraph(schema)).toBe(true);
  });
});
