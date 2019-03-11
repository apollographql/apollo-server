import { DocumentNode, DefinitionNode, DirectiveDefinitionNode } from 'graphql';

const isDirectiveNode = (
  node: DefinitionNode,
): node is DirectiveDefinitionNode => node.kind === 'DirectiveDefinition';

export const isDirectiveDefined = (
  typeDefs: DocumentNode[],
  directiveName: string,
) =>
  typeDefs.some(typeDef =>
    typeDef.definitions.some(
      definition =>
        isDirectiveNode(definition) && definition.name.value === directiveName,
    ),
  );
