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
import { isTypeNodeAnEntity, diffTypeNodes } from '../../utils';

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

    /*
     * Return early for value types
     * Value types:
     * 1) have the same kind (type, interface, input), extensions are excluded
     * 2) are not entities
     * 3) have the same set of fields
     */
    if (
      typeNodeFromSchema &&
      node.kind !== Kind.UNION_TYPE_DEFINITION &&
      !isTypeNodeAnEntity(node) &&
      !isTypeNodeAnEntity(typeNodeFromSchema)
    ) {
      const possibleErrors: GraphQLError[] = [];
      // By inspecting the diff, we can warn when field types mismatch.
      // A diff entry will exist when a field exists on one type and not the other, or if there is a type mismatch on the field
      // i.e. { sku: [Int, String!], color: [String] }
      const { kind, fields } = diffTypeNodes(node, typeNodeFromSchema, schema);

      // If the kinds don't match, we want to error if types have the same shape
      if (kind.length > 0) {
        possibleErrors.push(
          new GraphQLError(
            `Found kind mismatch on expected value type. '${typeName}' is defined as both a ${kind[0]} and a ${kind[1]}. In order to define ${typeName} in multiple places, the kinds must be identical.`,
          ),
        );
      }

      const fieldsDiff = Object.entries(fields);
      const typesHaveSameShape =
        fieldsDiff.length === 0 ||
        fieldsDiff.every(([fieldName, types]) => {
          // If a diff entry has two types, then the field name matches but the types do not.
          // In this case, we can push a useful error to hint to the user that we
          // think they tried to define a value type, but one of the fields has a type mismatch.
          if (types.length === 2) {
            possibleErrors.push(
              new GraphQLError(
                `Found field type mismatch on expected value type. '${typeName}.${fieldName}' is defined as both a ${types[0]} and a ${types[1]}. In order to define '${typeName}' in multiple places, the fields and their types must be identical.`,
                [node, typeNodeFromSchema],
              ),
            );
            return true;
          }
          return false;
        });

      if (typesHaveSameShape) {
        // Only push these errors if we have what looks like a value type
        possibleErrors.forEach(error => context.reportError(error));
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
