import { DocumentNode, Kind } from 'graphql/language';
import { gql } from '../';

export const isDirectiveDefined = (
  typeDefs: DocumentNode[] | string,
  directiveName: string,
): boolean => {
  if (typeof typeDefs === 'string') {
    return isDirectiveDefined([gql(typeDefs)], directiveName);
  }
  return typeDefs.some(typeDef =>
    Object.prototype.hasOwnProperty.call(typeDef, 'definitions')
      ? typeDef.definitions.some(
          definition =>
            definition.kind === Kind.DIRECTIVE_DEFINITION &&
            definition.name.value === directiveName,
        )
      : false,
  );
};
