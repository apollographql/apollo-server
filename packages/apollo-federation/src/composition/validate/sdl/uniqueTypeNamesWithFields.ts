import {
  GraphQLError,
  ASTVisitor,
  ObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  InputObjectTypeDefinitionNode,
} from 'graphql';

import { SDLValidationContext } from 'graphql/validation/ValidationContext';
import Maybe from 'graphql/tsutils/Maybe';
import {
  isTypeNodeAnEntity,
  diffTypeNodes,
  errorWithCode,
  logServiceAndType,
} from '../../utils';

// Types of nodes this validator is responsible for
type TypesWithRequiredUniqueNames =
  | ObjectTypeDefinitionNode
  | InterfaceTypeDefinitionNode
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
export function UniqueTypeNamesWithFields(
  context: SDLValidationContext,
): ASTVisitor {
  const knownTypes: {
    [typeName: string]: TypesWithRequiredUniqueNames;
  } = Object.create(null);
  const schema = context.getSchema();

  return {
    // ScalarTypeDefinition: checkTypeName,
    ObjectTypeDefinition: checkTypeName,
    InterfaceTypeDefinition: checkTypeName,
    // UnionTypeDefinition: checkTypeName,
    // EnumTypeDefinition: checkTypeName,
    InputObjectTypeDefinition: checkTypeName,
  };

  function checkTypeName(node: TypesWithRequiredUniqueNames) {
    const typeName = node.name.value;
    const typeFromSchema = schema && schema.getType(typeName);
    const typeNodeFromSchema =
      typeFromSchema &&
      (typeFromSchema.astNode as Maybe<TypesWithRequiredUniqueNames>);

    const typeNodeFromDefs = knownTypes[typeName];
    const duplicateTypeNode = typeNodeFromSchema || typeNodeFromDefs;

    /*
     * Return early for value types
     * Value types:
     * 1) have the same kind (type, interface, input), extensions are excluded
     * 2) are not entities
     * 3) have the same set of fields
     */
    if (duplicateTypeNode) {
      const possibleErrors: GraphQLError[] = [];
      // By inspecting the diff, we can warn when field types mismatch.
      // A diff entry will exist when a field exists on one type and not the other, or if there is a type mismatch on the field
      // i.e. { sku: [Int, String!], color: [String] }
      const { kind, fields } = diffTypeNodes(node, duplicateTypeNode);

      const fieldsDiff = Object.entries(fields);
      const typesHaveSameShape =
        fieldsDiff.length === 0 ||
        fieldsDiff.every(([fieldName, types]) => {
          // If a diff entry has two types, then the field name matches but the types do not.
          // In this case, we can push a useful error to hint to the user that we
          // think they tried to define a value type, but one of the fields has a type mismatch.
          if (types.length === 2) {
            possibleErrors.push(
              errorWithCode(
                'VALUE_TYPE_FIELD_TYPE_MISMATCH',
                `${logServiceAndType(
                  duplicateTypeNode.serviceName!,
                  typeName,
                  fieldName,
                )}A field was defined differently in different services. \`${
                  duplicateTypeNode.serviceName
                }\` and \`${
                  node.serviceName
                }\` define \`${typeName}.${fieldName}\` as a ${types[1]} and ${
                  types[0]
                } respectively. In order to define \`${typeName}\` in multiple places, the fields and their types must be identical.`,
                [node, duplicateTypeNode],
              ),
            );
            return true;
          }
          return false;
        });

      // Once we determined that types have the same shape (name, kind, and field
      // names), we can provide useful errors
      if (typesHaveSameShape) {
        // Report errors that were collected while determining the matching shape of the types
        possibleErrors.forEach(error => context.reportError(error));

        // Error if the kinds don't match
        if (kind.length > 0) {
          context.reportError(
            errorWithCode(
              'VALUE_TYPE_KIND_MISMATCH',
              `${logServiceAndType(
                duplicateTypeNode.serviceName!,
                typeName,
              )}Found kind mismatch on expected value type belonging to services \`${
                duplicateTypeNode.serviceName
              }\` and \`${
                node.serviceName
              }\`. \`${typeName}\` is defined as both a \`${
                kind[0]
              }\` and a \`${
                kind[1]
              }\`. In order to define \`${typeName}\` in multiple places, the kinds must be identical.`,
              [node, duplicateTypeNode],
            ),
          );
        }

        // Error if either is an entity
        if (isTypeNodeAnEntity(node) || isTypeNodeAnEntity(duplicateTypeNode)) {
          const entityNode = isTypeNodeAnEntity(duplicateTypeNode)
            ? duplicateTypeNode
            : node;

          context.reportError(
            errorWithCode(
              'VALUE_TYPE_NO_ENTITY',
              `${logServiceAndType(
                entityNode.serviceName!,
                typeName,
              )}Value types cannot be entities (using the \`@key\` directive). Please ensure that the \`${typeName}\` type is extended properly or remove the \`@key\` directive if this is not an entity.`,
              [node, duplicateTypeNode],
            ),
          );
        }

        return false;
      }
    }

    if (typeFromSchema) {
      context.reportError(
        new GraphQLError(existedTypeNameMessage(typeName), node.name),
      );
      return;
    }

    if (knownTypes[typeName]) {
      context.reportError(
        new GraphQLError(duplicateTypeNameMessage(typeName), [
          knownTypes[typeName],
          node.name,
        ]),
      );
    } else {
      knownTypes[typeName] = node;
    }

    return false;
  }
}
