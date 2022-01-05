import {
  DocumentNode,
  GraphQLSchema,
  isInterfaceType,
  separateOperations,
  TypeInfo,
  visit,
  visitWithTypeInfo,
} from 'graphql';
import { ReferencedFieldsForType } from 'apollo-reporting-protobuf';

export type ReferencedFieldsByType = Record<string, ReferencedFieldsForType>;

export function calculateReferencedFieldsByType({
  document,
  schema,
  resolvedOperationName,
}: {
  document: DocumentNode;
  resolvedOperationName: string | null;
  schema: GraphQLSchema;
}): ReferencedFieldsByType {
  // If the document contains multiple operations, we only care about fields
  // referenced in the operation we're using and in fragments that are
  // (transitively) spread by that operation. (This is because Studio's field
  // usage accounting is all by operation, not by document.) This does mean that
  // a field can be textually present in a GraphQL document (and need to exist
  // for validation) without being represented in the reported referenced fields
  // structure, but we'd need to change the data model of Studio to be based on
  // documents rather than fields if we wanted to improve that.
  const documentSeparatedByOperation = separateOperations(document);
  const filteredDocument =
    documentSeparatedByOperation[resolvedOperationName ?? ''];
  if (!filteredDocument) {
    // This shouldn't happen because we only should call this function on
    // properly executable documents.
    throw Error(
      `shouldn't happen: operation '${resolvedOperationName ?? ''}' not found`,
    );
  }
  const typeInfo = new TypeInfo(schema);
  const interfaces = new Set<string>();
  const referencedFieldSetByType: Record<string, Set<string>> = Object.create(
    null,
  );
  visit(
    filteredDocument,
    visitWithTypeInfo(typeInfo, {
      Field(field) {
        const fieldName = field.name.value;
        const parentType = typeInfo.getParentType();
        if (!parentType) {
          throw Error(
            `shouldn't happen: missing parent type for field ${fieldName}`,
          );
        }
        const parentTypeName = parentType.name;
        if (!referencedFieldSetByType[parentTypeName]) {
          referencedFieldSetByType[parentTypeName] = new Set<string>();
          if (isInterfaceType(parentType)) {
            interfaces.add(parentTypeName);
          }
        }
        referencedFieldSetByType[parentTypeName].add(fieldName);
      },
    }),
  );

  // Convert from initial representation (which uses Sets to avoid quadratic
  // behavior) to the protobufjs objects. (We could also use js_use_toArray here
  // but that seems a little overkill.)
  const referencedFieldsByType = Object.create(null);
  for (const [typeName, fieldNames] of Object.entries(
    referencedFieldSetByType,
  )) {
    referencedFieldsByType[typeName] = new ReferencedFieldsForType({
      fieldNames: [...fieldNames],
      isInterface: interfaces.has(typeName),
    });
  }
  return referencedFieldsByType;
}
