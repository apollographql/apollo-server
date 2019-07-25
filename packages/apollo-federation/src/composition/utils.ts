import 'apollo-server-env';
import { isNotNullOrUndefined } from 'apollo-env';
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
  SelectionNode,
  isEqualType,
  FieldNode,
  InterfaceTypeDefinitionNode,
} from 'graphql';
import Maybe from 'graphql/tsutils/Maybe';
import { ExternalFieldDefinition } from './types';

export function isStringValueNode(node: any): node is StringValueNode {
  return node.kind === Kind.STRING;
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
    | InterfaceTypeDefinitionNode
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
  const returnType = getNamedType(node.type);
  if (!isObjectType(returnType)) return [];

  const containingTypes: GraphQLObjectType[] = [];
  const types = schema.getTypeMap();
  for (const selectionSetType of Object.values(types)) {
    // Only object types have fields
    if (!isObjectType(selectionSetType)) continue;
    const allFields = selectionSetType.getFields();

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

/**
 * Used for finding a field on the `schema` that returns `typeToFind`
 *
 * Used in validation of external directives to find uses of a field in a
 * `@provides` on another type.
 */
export function findFieldsThatReturnType({
  schema,
  typeToFind,
}: {
  schema: GraphQLSchema;
  typeToFind: GraphQLNamedType;
}): GraphQLField<any, any>[] {
  if (!isObjectType(typeToFind)) return [];

  const fieldsThatReturnType: GraphQLField<any, any>[] = [];
  const types = schema.getTypeMap();

  for (const selectionSetType of Object.values(types)) {
    // for our purposes, only object types have fields that we care about.
    if (!isObjectType(selectionSetType)) continue;

    const fieldsOnNamedType = selectionSetType.getFields();

    // push fields that have return `typeToFind`
    Object.values(fieldsOnNamedType).forEach(field => {
      const fieldReturnType = getNamedType(field.type);
      if (fieldReturnType === typeToFind) {
        fieldsThatReturnType.push(field);
      }
    });
  }
  return fieldsThatReturnType;
}

/**
 * Searches recursively to see if a selection set includes references to
 * `typeToFind.fieldToFind`.
 *
 * Used in validation of external fields to find where/if a field is referenced
 * in a nested selection set for `@requires`
 *
 * For every selection, look at the root of the selection's type.
 * 1. If it's the type we're looking for, check its fields.
 *    Return true if field matches. Skip to step 3 if not
 * 2. If it's not the type we're looking for, skip to step 3
 * 3. Get the return type for each subselection and run this function on the subselection.
 */
export function selectionIncludesField({
  selections,
  selectionSetType,
  typeToFind,
  fieldToFind,
}: {
  selections: readonly SelectionNode[];
  selectionSetType: GraphQLObjectType; // type which applies to `selections`
  typeToFind: GraphQLObjectType; // type where the `@external` lives
  fieldToFind: string;
}): boolean {
  for (const selection of selections as FieldNode[]) {
    const selectionName: string = selection.name.value;

    // if the selected field matches the fieldname we're looking for,
    // and its type is correct, we're done. Return true;
    if (
      selectionName === fieldToFind &&
      isEqualType(selectionSetType, typeToFind)
    )
      return true;

    // if the field selection has a subselection, check each field recursively

    // check to make sure the parent type contains the field
    const typeIncludesField =
      selectionName &&
      Object.keys(selectionSetType.getFields()).includes(selectionName);
    if (!selectionName || !typeIncludesField) continue;

    // get the return type of the selection
    const returnType = getNamedType(
      selectionSetType.getFields()[selectionName].type,
    );
    if (!returnType || !isObjectType(returnType)) continue;
    const subselections =
      selection.selectionSet && selection.selectionSet.selections;

    // using the return type of a given selection and all the subselections,
    // recursively search for matching selections. typeToFind and fieldToFind
    // stay the same
    if (subselections) {
      const selectionDoesIncludeField = selectionIncludesField({
        selectionSetType: returnType,
        selections: subselections,
        typeToFind,
        fieldToFind,
      });
      if (selectionDoesIncludeField) return true;
    }
  }
  return false;
}

/**
 * A map of `Kind`s from their definition to their respective extensions
 */
export const defKindToExtKind: { [kind: string]: string } = {
  [Kind.SCALAR_TYPE_DEFINITION]: Kind.SCALAR_TYPE_EXTENSION,
  [Kind.OBJECT_TYPE_DEFINITION]: Kind.OBJECT_TYPE_EXTENSION,
  [Kind.INTERFACE_TYPE_DEFINITION]: Kind.INTERFACE_TYPE_EXTENSION,
  [Kind.UNION_TYPE_DEFINITION]: Kind.UNION_TYPE_EXTENSION,
  [Kind.ENUM_TYPE_DEFINITION]: Kind.ENUM_TYPE_EXTENSION,
  [Kind.INPUT_OBJECT_TYPE_DEFINITION]: Kind.INPUT_OBJECT_TYPE_EXTENSION,
};
