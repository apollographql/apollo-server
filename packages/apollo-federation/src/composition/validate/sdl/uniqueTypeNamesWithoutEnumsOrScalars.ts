import {
  GraphQLError,
  ASTVisitor,
  Kind,
  ObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  UnionTypeDefinitionNode,
  InputObjectTypeDefinitionNode,
  NameNode,
} from 'graphql';

import { SDLValidationContext } from 'graphql/validation/ValidationContext';
import Maybe from 'graphql/tsutils/Maybe';
import { isTypeNodeAnEntity, diffFieldsOnTypeNodes } from '../../utils';

// Types of nodes this validator is responsible for
type TypesWithRequiredUniqueNames =
  | ObjectTypeDefinitionNode
  | InterfaceTypeDefinitionNode
  | UnionTypeDefinitionNode
  | InputObjectTypeDefinitionNode;

export function duplicateTypeNameMessage(typeName: string): string {
  return `There can be only one type named "${typeName}".`;
}

export function existedTypeNameMessage(typeName: string): string {
  return `Type "${typeName}" already exists in the schema. It cannot also be defined in this type definition.`;
}

/**
 * Unique type names
 * A GraphQL document is only valid if all defined types have unique names.
 * Modified to allow duplicate enum and scalar names
 */
export function UniqueTypeNamesWithoutEnumsOrScalars(
  context: SDLValidationContext,
): ASTVisitor {
  const knownTypeNames: {
    [typeName: string]: NameNode;
  } = Object.create(null);
  const schema = context.getSchema();

  return {
    // ScalarTypeDefinition: checkTypeName,
    ObjectTypeDefinition: checkTypeName,
    InterfaceTypeDefinition: checkTypeName,
    UnionTypeDefinition: checkTypeName,
    // EnumTypeDefinition: checkTypeName,
    InputObjectTypeDefinition: checkTypeName,
  };

  function checkTypeName(node: TypesWithRequiredUniqueNames) {
    const typeName = node.name.value;
    const typeFromSchema = schema && schema.getType(typeName);
    const typeNodeFromSchema =
      typeFromSchema &&
      (typeFromSchema.astNode as Maybe<TypesWithRequiredUniqueNames>);

    // Return early for value types (non-entities that have the same exact fields)
    if (
      typeNodeFromSchema &&
      node.kind === typeNodeFromSchema.kind &&
      node.kind !== Kind.UNION_TYPE_DEFINITION &&
      !isTypeNodeAnEntity(node) &&
      !isTypeNodeAnEntity(typeNodeFromSchema)
    ) {
      const diff = diffFieldsOnTypeNodes(node, typeNodeFromSchema);
      const diffEntries = Object.entries(diff);
      const typesHaveSameShape =
        diffEntries.length === 0 ||
        diffEntries.every(([fieldName, types]) => {
          if (types.length === 2) {
            context.reportError(
              new GraphQLError(
                `Found field type mismatch on expected value type. '${node.name.value}.${fieldName}' is defined as both a ${types[0]} and a ${types[1]}. In order to define '${node.name.value}' in multiple places, the fields and their types must be identical.`,
                [node, typeNodeFromSchema],
              ),
            );
            return true;
          }
          return false;
        });

      if (typesHaveSameShape) {
        return false;
      }
    }

    if (typeNodeFromSchema) {
      context.reportError(
        new GraphQLError(existedTypeNameMessage(typeName), node.name),
      );
      return;
    }

    if (knownTypeNames[typeName]) {
      context.reportError(
        new GraphQLError(duplicateTypeNameMessage(typeName), [
          knownTypeNames[typeName],
          node.name,
        ]),
      );
    } else {
      knownTypeNames[typeName] = node.name;
    }

    return false;
  }
}
