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
import { Maybe } from '../../types';
import { diffTypeNodes, logServiceAndType } from '../../utils';

type TypeNodeWithFields = TypeDefinitionWithFields | TypeExtensionWithFields;

type TypeDefinitionWithFields =
  | InputObjectTypeDefinitionNode
  | InterfaceTypeDefinitionNode
  | ObjectTypeDefinitionNode;

type TypeExtensionWithFields =
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
  serviceName: string,
): string {
  return `${logServiceAndType(
    serviceName,
    typeName,
    fieldName,
  )}Field "${typeName}.${fieldName}" already exists in the schema. It cannot also be defined in this type extension. If this is meant to be an external field, add the \`@external\` directive.`;
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
    [key: string]: TypeNodeWithFields | undefined;
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

  function checkFieldUniqueness(node: TypeExtensionWithFields) {
    const typeName = node.name.value;

    if (!knownFieldNames[typeName]) {
      knownFieldNames[typeName] = Object.create(null);
    }

    if (!node.fields) {
      return false;
    }

    const fieldNames = knownFieldNames[typeName];

    for (const fieldDef of node.fields) {
      const fieldName = fieldDef.name.value;

      if (hasField(existingTypeMap[typeName], fieldName)) {
        context.reportError(
          new GraphQLError(
            existedFieldDefinitionNameMessage(
              typeName,
              fieldName,
              existingTypeMap[typeName].astNode!.serviceName!,
            ),
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

    return false;
  }

  /**
   * Similar to checkFieldUniqueness above, with some extra permissions:
   *
   * 1) Non-uniqueness *on value types* (same field names, same field types) should be permitted
   * 2) *Near* value types are also permitted here (with relevant errors in uniqueTypeNamesWithFields)
   *    - Near value types share only the same type name and field names. Permitting these cases allows
   *      us to catch and warn on likely user errors.
   *
   * @param node TypeDefinitionWithFields
   */
  function checkFieldUniquenessExcludingValueTypes(
    node: TypeDefinitionWithFields,
  ) {
    const typeName = node.name.value;

    const valueTypeFromSchema =
      existingTypeMap[typeName] &&
      (existingTypeMap[typeName].astNode as Maybe<TypeDefinitionWithFields>);
    const duplicateTypeNode =
      valueTypeFromSchema || possibleValueTypes[node.name.value];

    if (duplicateTypeNode) {
      const { fields } = diffTypeNodes(node, duplicateTypeNode);

      // This is the condition required for a *near* value type. At this point, we know the
      // parent type names are the same. We know the field names are the same if either:
      // 1) the field has no entry in the fields diff (they're identical), or
      // 2) the field's diff entry is an array of length 2 (both nodes have the field, but the field types are different)
      if (Object.values(fields).every(diffEntry => diffEntry.length === 2)) {
        return false;
      }
    } else {
      possibleValueTypes[node.name.value] = node;
    }

    if (!knownFieldNames[typeName]) {
      knownFieldNames[typeName] = Object.create(null);
    }

    if (!node.fields) {
      return false;
    }

    const fieldNames = knownFieldNames[typeName];

    for (const fieldDef of node.fields) {
      const fieldName = fieldDef.name.value;
      if (hasField(existingTypeMap[typeName], fieldName)) {
        context.reportError(
          new GraphQLError(
            existedFieldDefinitionNameMessage(
              typeName,
              fieldName,
              existingTypeMap[typeName].astNode!.serviceName!,
            ),
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

    return false;
  }
}

function hasField(type: GraphQLNamedType, fieldName: string) {
  if (isObjectType(type) || isInterfaceType(type) || isInputObjectType(type)) {
    return Boolean(type.getFields()[fieldName]);
  }
  return false;
}
