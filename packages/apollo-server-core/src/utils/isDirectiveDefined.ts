import { DocumentNode, Kind } from 'graphql/language';
import { gql } from '../';

export const isDirectiveDefined = (
  typeDefs: (DocumentNode | string)[],
  directiveName: string,
): boolean => {
  return typeDefs.some(typeDef => {
    if (typeof typeDef === 'string') {
      typeDef = gql(typeDef);
    }

    return typeDef.definitions.some(
      definition =>
        definition.kind === Kind.DIRECTIVE_DEFINITION &&
        definition.name.value === directiveName,
    );
  });
};
