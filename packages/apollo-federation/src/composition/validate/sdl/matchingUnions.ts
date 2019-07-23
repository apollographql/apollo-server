import { GraphQLError, ASTVisitor, UnionTypeDefinitionNode } from 'graphql';
import { SDLValidationContext } from 'graphql/validation/ValidationContext';
import Maybe from 'graphql/tsutils/Maybe';
import xorBy from 'lodash.xorby';
import { errorWithCode, logServiceAndType } from '../../utils';
import {
  existedTypeNameMessage,
  duplicateTypeNameMessage,
} from './uniqueTypeNamesWithFields';

/**
 * Unique type names
 * A GraphQL document is only valid if all defined types have unique names.
 * Modified to allow duplicate enum and scalar names
 */
export function UniqueUnionTypes(context: SDLValidationContext): ASTVisitor {
  const knownTypes: {
    [typeName: string]: UnionTypeDefinitionNode;
  } = Object.create(null);
  const schema = context.getSchema();

  return {
    UnionTypeDefinition: validateUnionTypes,
  };

  function validateUnionTypes(node: UnionTypeDefinitionNode) {
    const typeName = node.name.value;
    const typeFromSchema = schema && schema.getType(typeName);
    const typeNodeFromSchema =
      typeFromSchema &&
      (typeFromSchema.astNode as Maybe<UnionTypeDefinitionNode>);

    const typeNodeFromDefs = knownTypes[typeName];
    const duplicateTypeNode = typeNodeFromSchema || typeNodeFromDefs;

    // Exception for identical union types
    if (duplicateTypeNode) {
      const unionDiff = xorBy(
        node.types,
        duplicateTypeNode.types,
        'name.value',
      );

      const diffLength = unionDiff.length;
      if (diffLength > 0) {
        context.reportError(
          errorWithCode(
            'VALUE_TYPE_UNION_TYPES_MISMATCH',
            `${logServiceAndType(
              duplicateTypeNode.serviceName!,
              typeName,
            )}The union \`${typeName}\` is defined in services \`${
              duplicateTypeNode.serviceName
            }\` and \`${
              node.serviceName
            }\`, however their types do not match. Union types with the same name must also consist of identical types. The type${
              diffLength > 1 ? 's' : ''
            } ${unionDiff.map(diffEntry => diffEntry.name.value).join(', ')} ${
              diffLength > 1 ? 'are' : 'is'
            } mismatched.`,
            [node, duplicateTypeNode],
          ),
        );
      }

      return false;
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
