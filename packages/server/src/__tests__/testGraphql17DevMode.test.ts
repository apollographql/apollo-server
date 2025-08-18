import { describe, it, expect } from '@jest/globals';
import { GraphQLObjectType, isObjectType, version } from 'graphql17';

describe('canary graphql v17-alpha', () => {
  it('should work', () => {
    expect(version).toBe('17.0.0-alpha.9'); // this version is the latest alpha on which the canary is based
  });

  it('should use development mode when set by our Jest Config', () => {
    function getFakeGraphQLObjectType() {
      class GraphQLObjectType {
        get [Symbol.toStringTag]() {
          return 'GraphQLObjectType';
        }
      }
      return new GraphQLObjectType();
    }

    expect(isObjectType(new GraphQLObjectType({ name: 'SomeType', fields: {} }))).toBe(true);
    expect(() => isObjectType(getFakeGraphQLObjectType())).toThrow();
  });
});
