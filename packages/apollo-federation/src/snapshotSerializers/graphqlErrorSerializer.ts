import { GraphQLError } from 'graphql';
import { Plugin } from 'pretty-format';

export default {
  test(value: any) {
    return value && value instanceof GraphQLError;
  },

  print(value: GraphQLError, print) {
    return print({
      message: value.message,
      code: value.extensions ? value.extensions.code : 'MISSING_ERROR',
    });
  },
} as Plugin;
