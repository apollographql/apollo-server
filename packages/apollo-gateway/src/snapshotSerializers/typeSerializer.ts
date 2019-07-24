import { isNamedType, GraphQLNamedType, printType } from 'graphql';
import { Plugin } from 'pretty-format';

export default {
  test(value: any) {
    return value && isNamedType(value);
  },
  print(value: GraphQLNamedType) {
    return printType(value);
  },
} as Plugin;
