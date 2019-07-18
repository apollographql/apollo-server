import {
  ASTVisitor,
  NameNode,
  GraphQLError,
  InputObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  InputObjectTypeExtensionNode,
  InterfaceTypeExtensionNode,
  ObjectTypeExtensionNode,
  GraphQLNamedType,
  isObjectType,
  isInterfaceType,
  isInputObjectType,
} from 'graphql';
import { SDLValidationContext } from 'graphql/validation/ValidationContext';
import { TypeMap } from 'graphql/type/schema';
import Maybe from 'graphql/tsutils/Maybe';
import { isTypeNodeAnEntity, diffFieldsOnTypeNodes } from '../../utils';

type NodeTypesRequiringUniqueFields =
  | TypeDefinitionsRequiringUniqueFields
  | TypeExtensionsRequiringUniqueFields;

type TypeDefinitionsRequiringUniqueFields =
  | InputObjectTypeDefinitionNode
  | InterfaceTypeDefinitionNode
  | ObjectTypeDefinitionNode;

type TypeExtensionsRequiringUniqueFields =
  | InputObjectTypeExtensionNode
  | InterfaceTypeExtensionNode
  | ObjectTypeExtensionNode;

export function duplicateFieldDefinitionNameMessage(
  typeName: string,
  fieldName: string,
): string {
  return `Field "${typeName}.${fieldName}" can only be defined once.`;
}

export function existedFieldDefinitionNameMessage(
  typeName: string,
  fieldName: string,
): string {
  return `Field "${typeName}.${fieldName}" already exists in the schema. It cannot also be defined in this type extension.`;
}

/**
 * Unique field definition names
 *
 * A GraphQL complex type is only valid if all its fields are uniquely named.
 * Modified to permit duplicate field names on value types.
 */
export function UniqueFieldDefinitionNames(
  context: SDLValidationContext,
): ASTVisitor {
  const schema = context.getSchema();
  const existingTypeMap: TypeMap = schema
    ? schema.getTypeMap()
    : Object.create(null);
  interface FieldToNameNodeMap {
    [fieldName: string]: NameNode;
  }
  const knownFieldNames: {
    [typeName: string]: FieldToNameNodeMap;
  } = Object.create(null);

  const possibleValueTypes: {
    [key: string]: NodeTypesRequiringUniqueFields | undefined;
  } = Object.create(null);

  // Maintain original functionality for type extensions, but substitute our
  // more permissive validator for base types to allow value types
  return {
    InputObjectTypeExtension: checkFieldUniqueness,
    InterfaceTypeExtension: checkFieldUniqueness,
    ObjectTypeExtension: checkFieldUniqueness,
    InputObjectTypeDefinition: checkFieldUniquenessExcludingValueTypes,
    InterfaceTypeDefinition: checkFieldUniquenessExcludingValueTypes,
    ObjectTypeDefinition: checkFieldUniquenessExcludingValueTypes,
  };

  function checkFieldUniqueness(node: TypeExtensionsRequiringUniqueFields) {
    const typeName = node.name.value;

    if (!knownFieldNames[typeName]) {
      knownFieldNames[typeName] = Object.create(null);
    }

    if (node.fields) {
      const fieldNames = knownFieldNames[typeName];

      for (const fieldDef of node.fields) {
        const fieldName = fieldDef.name.value;

        if (hasField(existingTypeMap[typeName], fieldName)) {
          context.reportError(
            new GraphQLError(
              existedFieldDefinitionNameMessage(typeName, fieldName),
              fieldDef.name,
            ),
          );
        } else if (fieldNames[fieldName]) {
          context.reportError(
            new GraphQLError(
              duplicateFieldDefinitionNameMessage(typeName, fieldName),
              [fieldNames[fieldName], fieldDef.name],
            ),
          );
        } else {
          fieldNames[fieldName] = fieldDef.name;
        }
      }
    }

    return false;
  }

  function checkFieldUniquenessExcludingValueTypes(
    node: TypeDefinitionsRequiringUniqueFields,
  ) {
    const typeName = node.name.value;

    if (!isTypeNodeAnEntity(node)) {
      const valueTypeFromSchema =
        existingTypeMap[typeName] &&
        (existingTypeMap[typeName].astNode as Maybe<
          TypeDefinitionsRequiringUniqueFields
        >);
      const valueTypeNode =
        valueTypeFromSchema || possibleValueTypes[node.name.value];
      if (
        valueTypeNode &&
        !isTypeNodeAnEntity(valueTypeNode) &&
        valueTypeNode.kind === node.kind
      ) {
        const diff = diffFieldsOnTypeNodes(node, valueTypeNode);
        if (Object.values(diff).every(diffEntry => diffEntry.length === 2)) {
          return false;
        }
      } else {
        possibleValueTypes[node.name.value] = node;
      }
    }

    if (!knownFieldNames[typeName]) {
      knownFieldNames[typeName] = Object.create(null);
    }

    if (node.fields) {
      const fieldNames = knownFieldNames[typeName];

      for (const fieldDef of node.fields) {
        const fieldName = fieldDef.name.value;
        if (hasField(existingTypeMap[typeName], fieldName)) {
          context.reportError(
            new GraphQLError(
              existedFieldDefinitionNameMessage(typeName, fieldName),
              fieldDef.name,
            ),
          );
        } else if (fieldNames[fieldName]) {
          context.reportError(
            new GraphQLError(
              duplicateFieldDefinitionNameMessage(typeName, fieldName),
              [fieldNames[fieldName], fieldDef.name],
            ),
          );
        } else {
          fieldNames[fieldName] = fieldDef.name;
        }
      }
    }

    return false;
  }
}

function hasField(type: GraphQLNamedType, fieldName: string) {
  if (isObjectType(type) || isInterfaceType(type) || isInputObjectType(type)) {
    return Boolean(type.getFields()[fieldName]);
  }
  return false;
}
