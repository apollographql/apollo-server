import { DocumentNode, Kind } from 'graphql/language';
import { gql } from '../';

export const isDirectiveDefined = (
  typeDefs: (DocumentNode | string)[],
  directiveName: string,
): boolean => {
  // If we didn't receive an array of what we want, ensure it's an array.
  typeDefs = Array.isArray(typeDefs) ? typeDefs : [typeDefs];

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
