import {
  GraphQLError,
  ASTVisitor,
  print,
  visit,
  DocumentNode,
  Kind,
  ObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  UnionTypeDefinitionNode,
  InputObjectTypeDefinitionNode,
  FieldDefinitionNode,
  InputValueDefinitionNode,
  NameNode,
} from 'graphql';

import { SDLValidationContext } from 'graphql/validation/ValidationContext';
import Maybe from 'graphql/tsutils/Maybe';
import { isTypeNodeAnEntity } from '../../utils';

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
      areTypeNodesIdentical(node, typeNodeFromSchema, context) &&
      !isTypeNodeAnEntity(node) &&
      !isTypeNodeAnEntity(typeNodeFromSchema)
    ) {
      return false;
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

function areTypeNodesIdentical(
  node1: TypesWithRequiredUniqueNames,
  node2: TypesWithRequiredUniqueNames,
  context: SDLValidationContext,
) {
  const visitedFields: { [key: string]: string[] } = Object.create(null);

  const doc: DocumentNode = {
    kind: Kind.DOCUMENT,
    definitions: [node1, node2],
  };

  function fieldVisitor(node: FieldDefinitionNode | InputValueDefinitionNode) {
    const fieldName = node.name.value;

    if (!visitedFields[fieldName]) {
      visitedFields[fieldName] = [];
    }
    visitedFields[fieldName].push(print(node.type));
  }

  visit(doc, {
    FieldDefinition: fieldVisitor,
    InputValueDefinition: fieldVisitor,
  });

  const possibleErrors: GraphQLError[] = [];

  const entries = Object.entries(visitedFields);
  const fieldNamesOnTypeMatch =
    entries.length > 0 &&
    entries.every(([fieldName, types]) => {
      if (types.length === 2) {
        if (types[0] !== types[1]) {
          possibleErrors.push(
            new GraphQLError(
              `Found field type mismatch on expected value type. '${node1.name.value}.${fieldName}' is defined as both a ${types[0]} and a ${types[1]}. In order to define '${node1.name.value}' in multiple places, the fields and their types must be identical.`,
              [node1, node2],
            ),
          );
        }
        return true;
      }
      return false;
    });

  if (fieldNamesOnTypeMatch) {
    possibleErrors.forEach(error => {
      context.reportError(error);
    });
  }

  return fieldNamesOnTypeMatch;
}
