import {
  FieldNode,
  getNamedType,
  GraphQLCompositeType,
  GraphQLField,
  isCompositeType,
  Kind,
  SelectionNode,
  SelectionSetNode,
} from 'graphql';
import { getResponseName } from './utilities/graphql';

export interface Field<TParent = GraphQLCompositeType> {
  parentType: TParent;
  fieldNode: FieldNode;
  fieldDef: GraphQLField<any, any>;
}
export type FieldSet = Field[];

export function printFields(fields?: FieldSet) {
  if (!fields) return '[]';
  return (
    '[' +
    fields
      .map(field => `"${field.parentType.name}.${field.fieldDef.name}"`)
      .join(', ') +
    ']'
  );
}

export function matchesField(field: Field) {
  // TODO: Compare parent type and arguments
  return (otherField: Field) => {
    return field.fieldDef.name === otherField.fieldDef.name;
  };
}

function groupBy<T, U>(keyFunction: (element: T) => U) {
  return (iterable: Iterable<T>) => {
    const result = new Map<U, T[]>();

    for (const element of iterable) {
      const key = keyFunction(element);
      const group = result.get(key);

      if (group) {
        group.push(element);
      } else {
        result.set(key, [element]);
      }
    }

    return result;
  };
}

export const groupByResponseName = groupBy<Field, string>(field =>
  getResponseName(field.fieldNode),
);
export const groupByParentType = groupBy<Field, GraphQLCompositeType>(
  field => field.parentType,
);

export function selectionSetFromFieldSet(
  fields: FieldSet,
  parentType?: GraphQLCompositeType,
): SelectionSetNode {
  return {
    kind: Kind.SELECTION_SET,
    selections: Array.from(groupByParentType(fields)).flatMap(
      ([typeCondition, fieldsByParentType]: [GraphQLCompositeType, FieldSet]) =>
        wrapInInlineFragmentIfNeeded(
          Array.from(groupByResponseName(fieldsByParentType).values()).map(
            fieldsByResponseName => {
              return combineFields(typeCondition, fieldsByResponseName)
                .fieldNode;
            },
          ),
          typeCondition,
          parentType,
        ),
    ),
  };
}

function wrapInInlineFragmentIfNeeded(
  selections: SelectionNode[],
  typeCondition: GraphQLCompositeType,
  parentType?: GraphQLCompositeType,
): SelectionNode[] {
  return typeCondition === parentType
    ? selections
    : [
        {
          kind: Kind.INLINE_FRAGMENT,
          typeCondition: {
            kind: Kind.NAMED_TYPE,
            name: {
              kind: Kind.NAME,
              value: typeCondition.name,
            },
          },
          selectionSet: { kind: Kind.SELECTION_SET, selections },
        },
      ];
}

function combineFields(
  parentType: GraphQLCompositeType,
  fields: FieldSet,
): Field {
  const { fieldNode, fieldDef } = fields[0];
  const returnType = getNamedType(fieldDef.type);

  if (isCompositeType(returnType)) {
    return {
      parentType,
      fieldNode: {
        ...fieldNode,
        selectionSet: mergeSelectionSets(fields.map(field => field.fieldNode)),
      },
      fieldDef,
    };
  } else {
    return { parentType, fieldNode, fieldDef };
  }
}

function mergeSelectionSets(fieldNodes: FieldNode[]): SelectionSetNode {
  const selections: SelectionNode[] = [];

  for (const fieldNode of fieldNodes) {
    if (!fieldNode.selectionSet) continue;

    selections.push(...fieldNode.selectionSet.selections);
  }

  return {
    kind: 'SelectionSet',
    selections,
  };
}
