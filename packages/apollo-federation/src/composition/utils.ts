import 'apollo-server-env';
import {
  ObjectTypeDefinitionNode,
  InterfaceTypeExtensionNode,
  FieldDefinitionNode,
  Kind,
  StringValueNode,
  parse,
  OperationDefinitionNode,
  NameNode,
  DocumentNode,
  visit,
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
import { ExternalFieldDefinition } from './types';

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
    | ObjectTypeDefinitionNode
    | ObjectTypeExtensionNode
    | FieldDefinitionNode
    | InterfaceTypeExtensionNode
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
    ObjectTypeExtension: removeExternalFieldsFromExtensionVisitor(
      strippedFields,
      serviceName,
    ),
    InterfaceTypeExtension: removeExternalFieldsFromExtensionVisitor(
      strippedFields,
      serviceName,
    ),
  }) as DocumentNode;

  return { typeDefsWithoutExternalFields, strippedFields };
}

/**
 * Returns a closure that strips fields marked with `@external` and adds them
 * to an array.
 * @param collector
 * @param serviceName
 */
function removeExternalFieldsFromExtensionVisitor<
  T extends InterfaceTypeExtensionNode | ObjectTypeExtensionNode
>(collector: ExternalFieldDefinition[], serviceName: string) {
  return (node: T) => {
    let fields = node.fields;
    if (fields) {
      fields = fields.filter(field => {
        const externalDirectives = findDirectivesOnTypeOrField(
          field,
          'external',
        );

        if (externalDirectives.length > 0) {
          collector.push({
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
  };
}

export function parseSelections(source: string) {
  return (parse(`query { ${source} }`)
    .definitions[0] as OperationDefinitionNode).selectionSet.selections;
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
