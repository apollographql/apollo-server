import { SDLValidationContext } from 'graphql/validation/ValidationContext';
import {
  ASTVisitor,
  isObjectType,
  isScalarType,
  isInterfaceType,
  isUnionType,
  isEnumType,
  isInputObjectType,
  Kind,
  isTypeDefinitionNode,
  ObjectTypeExtensionNode,
  InterfaceTypeExtensionNode,
  GraphQLNamedType,
} from 'graphql';
import {
  errorWithCode,
  logServiceAndType,
  defKindToExtKind,
} from '../../utils';

type FederatedExtensionNode = (
  | ObjectTypeExtensionNode
  | InterfaceTypeExtensionNode) & {
  serviceName?: string | null;
};

// This is a variant of the PossibleTypeExtensions validator in graphql-js.
// it was modified to only check object/interface extensions. A custom error
// message was also added.
// original here: https://github.com/graphql/graphql-js/blob/master/src/validation/rules/PossibleTypeExtensions.js
export function PossibleTypeExtensions(
  context: SDLValidationContext,
): ASTVisitor {
  const schema = context.getSchema();
  const definedTypes = Object.create(null);

  for (const def of context.getDocument().definitions) {
    if (isTypeDefinitionNode(def)) {
      definedTypes[def.name.value] = def;
    }
  }

  const checkExtension = (node: FederatedExtensionNode) => {
    const typeName = node.name.value;
    const defNode = definedTypes[typeName];
    const existingType = schema && schema.getType(typeName);

    const serviceName = node.serviceName;
    if (!serviceName) return;

    if (defNode) {
      const expectedKind = defKindToExtKind[defNode.kind];
      const baseKind = defNode.kind;
      if (expectedKind !== node.kind) {
        context.reportError(
          errorWithCode(
            'EXTENSION_OF_WRONG_KIND',
            logServiceAndType(serviceName, typeName) +
              `\`${typeName}\` was originally defined as a ${baseKind} and can only be extended by a ${expectedKind}. ${serviceName} defines ${typeName} as a ${node.kind}`,
          ),
        );
      }
    } else if (existingType) {
      const expectedKind = typeToExtKind(existingType);
      const baseKind = typeToKind(existingType);
      if (expectedKind !== node.kind) {
        context.reportError(
          errorWithCode(
            'EXTENSION_OF_WRONG_KIND',
            logServiceAndType(serviceName, typeName) +
              `\`${typeName}\` was originally defined as a ${baseKind} and can only be extended by a ${expectedKind}. ${serviceName} defines ${typeName} as a ${node.kind}`,
          ),
        );
      }
    } else {
      context.reportError(
        errorWithCode(
          'EXTENSION_WITH_NO_BASE',
          logServiceAndType(serviceName, typeName) +
            `\`${typeName}\` is an extension type, but \`${typeName}\` is not defined in any service`,
        ),
      );
    }
  };

  return {
    ObjectTypeExtension: checkExtension,
    InterfaceTypeExtension: checkExtension,
  };
}

// These following utility functions/objects are part of the
// PossibleTypeExtensions validations in graphql-js, but not exported.
// https://github.com/graphql/graphql-js/blob/d8c1dfdc9dbbdef2400363cb0748d50cbeef39a8/src/validation/rules/PossibleTypeExtensions.js#L110
function typeToExtKind(type: GraphQLNamedType) {
  if (isScalarType(type)) {
    return Kind.SCALAR_TYPE_EXTENSION;
  } else if (isObjectType(type)) {
    return Kind.OBJECT_TYPE_EXTENSION;
  } else if (isInterfaceType(type)) {
    return Kind.INTERFACE_TYPE_EXTENSION;
  } else if (isUnionType(type)) {
    return Kind.UNION_TYPE_EXTENSION;
  } else if (isEnumType(type)) {
    return Kind.ENUM_TYPE_EXTENSION;
  } else if (isInputObjectType(type)) {
    return Kind.INPUT_OBJECT_TYPE_EXTENSION;
  }
  return null;
}

// this function is purely for printing out the `Kind` of the base type def.
function typeToKind(type: GraphQLNamedType) {
  if (isScalarType(type)) {
    return Kind.SCALAR_TYPE_DEFINITION;
  } else if (isObjectType(type)) {
    return Kind.OBJECT_TYPE_DEFINITION;
  } else if (isInterfaceType(type)) {
    return Kind.INTERFACE_TYPE_DEFINITION;
  } else if (isUnionType(type)) {
    return Kind.UNION_TYPE_DEFINITION;
  } else if (isEnumType(type)) {
    return Kind.ENUM_TYPE_DEFINITION;
  } else if (isInputObjectType(type)) {
    return Kind.INPUT_OBJECT_TYPE_DEFINITION;
  }
  return null;
}
