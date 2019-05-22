import { DocumentNode, Kind } from 'graphql/language';

export const isDirectiveDefined = (
  typeDefs: DocumentNode[],
  directiveName: string,
) =>
  typeDefs.some(typeDef =>
    typeDef.definitions.some(
      definition =>
        definition.kind === Kind.DIRECTIVE_DEFINITION &&
        definition.name.value === directiveName,
    ),
  );
