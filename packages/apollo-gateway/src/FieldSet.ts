import {
  FieldNode,
  getNamedType,
  GraphQLCompositeType,
  GraphQLField,
  isCompositeType,
  Kind,
  SelectionNode,
  SelectionSetNode,
  GraphQLObjectType,
  FragmentSpreadNode,
} from 'graphql';
import { getResponseName } from './utilities/graphql';
import { QueryPlanningContext } from './buildQueryPlan';

export interface Field<
  TParent extends GraphQLCompositeType = GraphQLCompositeType
> {
  scope: Scope<TParent>;
  fieldNode: FieldNode;
  fieldDef: GraphQLField<any, any>;
}

export interface Scope<TParent extends GraphQLCompositeType> {
  parentType: TParent;
  possibleTypes: ReadonlyArray<GraphQLObjectType>;
  enclosingScope?: Scope<GraphQLCompositeType>;
}

export type FieldSet = Field[];

export function printFields(fields?: FieldSet) {
  if (!fields) return '[]';
  return (
    '[' +
    fields
      .map(field => `"${field.scope.parentType.name}.${field.fieldDef.name}"`)
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
  getResponseName(field.fieldNode)
);

export const groupByParentType = groupBy<Field, GraphQLCompositeType>(
  field => field.scope.parentType,
);

export function selectionSetFromFieldSet(
  fields: FieldSet,
  context: QueryPlanningContext,
  parentType?: GraphQLCompositeType,
  fragmentSpreads?: FragmentSpreadNode[],
): SelectionSetNode {
  return {
    kind: Kind.SELECTION_SET,
    selections: [
      ...Array.from(groupByParentType(fields)).flatMap(
        ([typeCondition, fieldsByParentType]: [
          GraphQLCompositeType,
          FieldSet,
        ]) =>
          wrapInInlineFragmentIfNeeded(
            Array.from(groupByResponseName(fieldsByParentType).values()).map(
              fieldsByResponseName => {
                return combineFields(fieldsByResponseName, context).fieldNode;
              },
            ),
            typeCondition,
            parentType,
          ),
      ),
      ...(fragmentSpreads ? fragmentSpreads : []),
    ],
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
  fields: FieldSet,
  context: QueryPlanningContext
): Field {
  const { scope, fieldNode, fieldDef } = fields[0];
  const returnType = getNamedType(fieldDef.type);

  if (isCompositeType(returnType)) {
    const fragmentSpreads: FragmentSpreadNode[] = [];
    const fieldSet: FieldSet = [];

    for (const field of fields.flat()) {
      const { subfields, visitedFragments } = context.getSubFields(
        returnType,
        field,
      );
      fieldSet.push(...subfields);
      fragmentSpreads.push(...Object.values(visitedFragments));
    }

    return {
      scope,
      fieldNode: {
        ...fieldNode,
        selectionSet: selectionSetFromFieldSet(
          fieldSet,
          context,
          returnType,
          fragmentSpreads,
        ),
      },
      fieldDef,
    };
  } else {
    return { scope, fieldNode, fieldDef };
  }
}
