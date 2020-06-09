import { DefaultRootOperationTypeName } from './types';
import {
  DocumentNode,
  visit,
  ObjectTypeDefinitionNode,
  ObjectTypeExtensionNode,
  Kind,
  InterfaceTypeDefinitionNode,
  VisitFn,
  specifiedDirectives,
} from 'graphql';
import {
  findDirectivesOnTypeOrField,
  defKindToExtKind,
  reservedRootFields,
  defaultRootOperationNameLookup
} from './utils';
import federationDirectives from '../directives';

export function normalizeTypeDefs(typeDefs: DocumentNode) {
  // The order of this is important - `stripCommonPrimitives` must come after
  // `defaultRootOperationTypes` because it depends on the `Query` type being named
  // its default: `Query`.
  return stripCommonPrimitives(
    defaultRootOperationTypes(
      replaceExtendedDefinitionsWithExtensions(typeDefs),
    ),
  );
}

export function defaultRootOperationTypes(
  typeDefs: DocumentNode,
): DocumentNode {
  // Array of default root operation names
  const defaultRootOperationNames = Object.values(
    defaultRootOperationNameLookup,
  );

  // Map of the given root operation type names to their respective default operation
  // type names, i.e. {RootQuery: 'Query'}
  let rootOperationTypeMap: {
    [key: string]: DefaultRootOperationTypeName;
  } = Object.create(null);

  let hasSchemaDefinitionOrExtension = false;
  visit(typeDefs, {
    OperationTypeDefinition(node) {
      // If we find at least one root operation type definition, we know the user has
      // specified either a schema definition or extension.
      hasSchemaDefinitionOrExtension = true;
      // Build the map of root operation type name to its respective default
      rootOperationTypeMap[node.type.name.value] =
        defaultRootOperationNameLookup[node.operation];
    },
  });

  // In this case, there's no defined schema or schema extension, so we use defaults
  if (!hasSchemaDefinitionOrExtension) {
    rootOperationTypeMap = {
      Query: 'Query',
      Mutation: 'Mutation',
      Subscription: 'Subscription',
    };
  }

  // A conflicting default definition exists when the user provides a schema
  // definition, but also defines types that use the default root operation
  // names (Query, Mutation, Subscription). Those types need to be removed.
  let schemaWithoutConflictingDefaultDefinitions;
  if (!hasSchemaDefinitionOrExtension) {
    // If no schema definition or extension exists, then there aren't any
    // conflicting defaults to worry about.
    schemaWithoutConflictingDefaultDefinitions = typeDefs;
  } else {
    // If the user provides a schema definition or extension, then using default
    // root operation names is considered an error for composition. This visit
    // drops the invalid type definitions/extensions altogether, as well as
    // fields that reference them.
    //
    // Example:
    //
    // schema {
    //   query: RootQuery
    // }
    //
    // type Query { <--- this type definition is invalid (as well as Mutation or Subscription)
    //   ...
    // }
    schemaWithoutConflictingDefaultDefinitions = visit(typeDefs, {
      ObjectTypeDefinition(node) {
        if (
            (defaultRootOperationNames as string[]).includes(node.name.value) &&
            !rootOperationTypeMap[node.name.value]
        ) {
          return null;
        }
        return;
      },
      ObjectTypeExtension(node) {
        if (
            (defaultRootOperationNames as string[]).includes(node.name.value) &&
            !rootOperationTypeMap[node.name.value]
        ) {
          return null;
        }
        return;
      },
      // This visitor handles the case where:
      // 1) A schema definition or extension is provided by the user
      // 2) A field exists that is of a _default_ root operation type. (Query, Mutation, Subscription)
      //
      // Example:
      //
      // schema {
      //   mutation: RootMutation
      // }
      //
      // type RootMutation {
      //   updateProduct: Query <--- remove this field altogether
      // }
      FieldDefinition(node) {
        if (
          node.type.kind === Kind.NAMED_TYPE &&
          (defaultRootOperationNames as string[]).includes(node.type.name.value)
        ) {
          return null;
        }

        if (
          node.type.kind === Kind.NON_NULL_TYPE &&
          node.type.type.kind === Kind.NAMED_TYPE &&
          (defaultRootOperationNames as string[]).includes(
            node.type.type.name.value,
          )
        ) {
          return null;
        }
        return;
      },
    });
  }

  const schemaWithDefaultRootTypes = visit(
    schemaWithoutConflictingDefaultDefinitions,
    {
      // Schema definitions and extensions are extraneous since we're transforming
      // the root operation types to their defaults.
      SchemaDefinition() {
        return null;
      },
      SchemaExtension() {
        return null;
      },
      ObjectTypeDefinition(node) {
        if (
          node.name.value in rootOperationTypeMap ||
          (defaultRootOperationNames as string[]).includes(node.name.value)
        ) {
          return {
            ...node,
            name: {
              ...node.name,
              value: rootOperationTypeMap[node.name.value] || node.name.value,
            },
            kind: Kind.OBJECT_TYPE_EXTENSION,
          };
        }
        return;
      },
      // schema {
      //   query: RootQuery
      // }
      //
      // extend type RootQuery { <--- update this to `extend type Query`
      //   ...
      // }
      ObjectTypeExtension(node) {
        if (
          node.name.value in rootOperationTypeMap ||
          (defaultRootOperationNames as string[]).includes(node.name.value)
        ) {
          return {
            ...node,
            name: {
              ...node.name,
              value: rootOperationTypeMap[node.name.value] || node.name.value,
            },
          };
        }
        return;
      },
      // Corresponding NamedTypes must also make the name switch, in the case that
      // they reference a root operation type that we've transformed
      //
      // schema {
      //   query: RootQuery
      //   mutation: RootMutation
      // }
      //
      // type RootQuery {
      //   ...
      // }
      //
      // type RootMutation {
      //   updateProduct: RootQuery <--- rename `RootQuery` to `Query`
      // }
      NamedType(node) {
        if (node.name.value in rootOperationTypeMap) {
          return {
            ...node,
            name: {
              ...node.name,
              value: rootOperationTypeMap[node.name.value],
            },
          };
        }
        return;
      },
    },
  );

  return schemaWithDefaultRootTypes;
}

// type definitions with the @extends directive should be treated
// as type extensions.
export function replaceExtendedDefinitionsWithExtensions(
  typeDefs: DocumentNode,
) {
  const typeDefsWithExtendedTypesReplaced = visit(typeDefs, {
    ObjectTypeDefinition: visitor,
    InterfaceTypeDefinition: visitor,
  });

  function visitor(
    node: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode,
  ) {
    const isExtensionDefinition =
      findDirectivesOnTypeOrField(node, 'extends').length > 0;

    if (!isExtensionDefinition) {
      return node;
    }

    const filteredDirectives =
      node.directives &&
      node.directives.filter(directive => directive.name.value !== 'extends');

    return {
      ...node,
      ...(filteredDirectives && { directives: filteredDirectives }),
      kind: defKindToExtKind[node.kind],
    };
  }

  return typeDefsWithExtendedTypesReplaced;
}

// For non-ApolloServer libraries that support federation, this allows a
// library to report the entire schema's SDL rather than an awkward, stripped out
// subset of the schema. Generally there's no need to include the federation
// primitives, but in many cases it's more difficult to exclude them.
//
// This removes the following from a GraphQL Document:
// directives: @external, @key, @requires, @provides, @extends, @skip, @include, @deprecated, @specifiedBy
// scalars: _Any, _FieldSet
// union: _Entity
// object type: _Service
// Query fields: _service, _entities
export function stripCommonPrimitives(document: DocumentNode) {
  const typeDefinitionVisitor: VisitFn<
    any,
    ObjectTypeDefinitionNode | ObjectTypeExtensionNode
  > = (node) => {
    // Remove the `_entities` and `_service` fields from the `Query` type
    if (node.name.value === defaultRootOperationNameLookup.query) {
      const filteredFieldDefinitions = node.fields?.filter(
        (fieldDefinition) =>
          !reservedRootFields.includes(fieldDefinition.name.value),
      );

      // If the 'Query' type is now empty just remove it
      if (!filteredFieldDefinitions || filteredFieldDefinitions.length === 0) {
        return null;
      }

      return {
        ...node,
        fields: filteredFieldDefinitions,
      };
    }

    // Remove the _Service type from the document
    const isFederationType = node.name.value === '_Service';
    return isFederationType ? null : node;
  };

  return visit(document, {
    // Remove all common directive definitions from the document
    DirectiveDefinition(node) {
      const isCommonDirective = [...federationDirectives, ...specifiedDirectives].some(
        (directive) => directive.name === node.name.value,
      );
      return isCommonDirective ? null : node;
    },
    // Remove all federation scalar definitions from the document
    ScalarTypeDefinition(node) {
      const isFederationScalar = ['_Any', '_FieldSet'].includes(
        node.name.value,
      );
      return isFederationScalar ? null : node;
    },
    // Remove all federation union definitions from the document
    UnionTypeDefinition(node) {
      const isFederationUnion = node.name.value === "_Entity";
      return isFederationUnion ? null : node;
    },
    ObjectTypeDefinition: typeDefinitionVisitor,
    ObjectTypeExtension: typeDefinitionVisitor,
  });
}
