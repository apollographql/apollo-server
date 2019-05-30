import 'apollo-server-env';
import {
  ObjectTypeDefinitionNode,
  FieldDefinitionNode,
  Kind,
  StringValueNode,
  parse,
  OperationDefinitionNode,
  NameNode,
  DocumentNode,
  visit,
  OperationTypeNode,
  ObjectTypeExtensionNode,
  DirectiveNode,
  GraphQLNamedType,
  GraphQLError,
  GraphQLSchema,
  isObjectType,
  GraphQLObjectType,
  getNamedType,
  GraphQLField,
} from 'graphql';
import Maybe from 'graphql/tsutils/Maybe';
import { ExternalFieldDefinition, DefaultRootOperationTypeName } from './types';

export function isStringValueNode(node: any): node is StringValueNode {
  return node.kind === Kind.STRING;
}

export function isNotNullOrUndefined<T>(
  value: T | null | undefined,
): value is T {
  return value !== null && typeof value !== 'undefined';
}

// Create a map of { fieldName: serviceName } for each field.
export function mapFieldNamesToServiceName<Node extends { name: NameNode }>(
  fields: ReadonlyArray<Node>,
  serviceName: string,
) {
  return fields.reduce((prev, next) => {
    prev[next.name.value] = serviceName;
    return prev;
  }, Object.create(null));
}

export function findDirectivesOnTypeOrField(
  node: Maybe<
    ObjectTypeDefinitionNode | ObjectTypeExtensionNode | FieldDefinitionNode
  >,
  directiveName: string,
) {
  return node && node.directives
    ? node.directives.filter(
        directive => directive.name.value === directiveName,
      )
    : [];
}

export function stripExternalFieldsFromTypeDefs(
  typeDefs: DocumentNode,
  serviceName: string,
): {
  typeDefsWithoutExternalFields: DocumentNode;
  strippedFields: ExternalFieldDefinition[];
} {
  const strippedFields: ExternalFieldDefinition[] = [];

  const typeDefsWithoutExternalFields = visit(typeDefs, {
    ObjectTypeExtension(node) {
      let fields = node.fields;
      if (fields) {
        fields = fields.filter(field => {
          const externalDirectives = findDirectivesOnTypeOrField(
            field,
            'external',
          );

          if (externalDirectives.length > 0) {
            strippedFields.push({
              field,
              parentTypeName: node.name.value,
              serviceName,
            });
            return false;
          }
          return true;
        });
      }
      return {
        ...node,
        fields,
      };
    },
  }) as DocumentNode;

  return { typeDefsWithoutExternalFields, strippedFields };
}

export function replaceExtendedDefinitionsWithExtensions(
  typeDefs: DocumentNode,
) {
  const typeDefsWithExtendedTypesReplaced = visit(typeDefs, {
    ObjectTypeDefinition(node) {
      const isExtensionDefinition =
        findDirectivesOnTypeOrField(node as ObjectTypeDefinitionNode, 'extends')
          .length > 0;
      return isExtensionDefinition
        ? {
            ...node,
            kind: Kind.OBJECT_TYPE_EXTENSION,
          }
        : node;
    },
  });

  return typeDefsWithExtendedTypesReplaced;
}

export function parseSelections(source: string) {
  return (parse(`query { ${source} }`)
    .definitions[0] as OperationDefinitionNode).selectionSet.selections;
}

export function defaultRootOperationTypes(
  typeDefs: DocumentNode,
): DocumentNode {
  // Map of OperationTypeNode to its respective default root operation type name
  const defaultRootOperationNameLookup: {
    [node in OperationTypeNode]: DefaultRootOperationTypeName
  } = {
    query: 'Query',
    mutation: 'Mutation',
    subscription: 'Subscription',
  };

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
        if ((defaultRootOperationNames as string[]).includes(node.name.value)) {
          return null;
        }
        return;
      },
      ObjectTypeExtension(node) {
        if ((defaultRootOperationNames as string[]).includes(node.name.value)) {
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

export function hasMatchingFieldInDirectives({
  directives,
  fieldNameToMatch,
  namedType,
}: {
  directives: DirectiveNode[];
  fieldNameToMatch: String;
  namedType: GraphQLNamedType;
}) {
  return Boolean(
    namedType.astNode &&
      directives
        // for each key directive, get the fields arg
        .map(keyDirective =>
          keyDirective.arguments &&
          isStringValueNode(keyDirective.arguments[0].value)
            ? {
                typeName: namedType.astNode!.name.value,
                keyArgument: keyDirective.arguments[0].value.value,
              }
            : null,
        )
        // filter out any null/undefined args
        .filter(isNotNullOrUndefined)
        // flatten all selections of the "fields" arg to a list of fields
        .flatMap(selection => parseSelections(selection.keyArgument))
        // find a field that matches the @external field
        .some(
          field =>
            field.kind === Kind.FIELD && field.name.value === fieldNameToMatch,
        ),
  );
}

export const logServiceAndType = (
  serviceName: string,
  typeName: string,
  fieldName?: string,
) => `[${serviceName}] ${typeName}${fieldName ? `.${fieldName} -> ` : ' -> '}`;

// TODO: allow passing of the other args here, rather than just message and code
export function errorWithCode(code: string, message: string) {
  return new GraphQLError(
    message,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    {
      code,
    },
  );
}

export function findTypesContainingFieldWithReturnType(
  schema: GraphQLSchema,
  node: GraphQLField<any, any>,
): GraphQLObjectType[] {
  if (!isObjectType(getNamedType(node.type))) return [];
  const returnType = getNamedType(node.type);
  if (!isObjectType(returnType)) return [];

  const containingTypes: GraphQLObjectType[] = [];
  const types = schema.getTypeMap();
  for (const [, namedType] of Object.entries(types)) {
    // Only object types have fields
    if (!isObjectType(namedType)) continue;
    const allFields = namedType.getFields();

    // only push types that have a field which returns the returnType
    Object.values(allFields).forEach(field => {
      const fieldReturnType = getNamedType(field.type);
      if (fieldReturnType === returnType) {
        containingTypes.push(fieldReturnType);
      }
    });
  }
  return containingTypes;
}
