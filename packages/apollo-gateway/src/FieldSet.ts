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
} from 'graphql';
import { getResponseName } from './utilities/graphql';
import { partition, groupBy } from './utilities/array';

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

export const groupByResponseName = groupBy<Field, string>(field =>
  getResponseName(field.fieldNode)
);

export const groupByParentType = groupBy<Field, GraphQLCompositeType>(
  field => field.scope.parentType,
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
              return combineFields(fieldsByResponseName)
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
  fields: FieldSet,
): Field {
  const { scope, fieldNode, fieldDef } = fields[0];
  const returnType = getNamedType(fieldDef.type);

  if (isCompositeType(returnType)) {
    return {
      scope,
      fieldNode: {
        ...fieldNode,
        selectionSet: mergeSelectionSets(fields.map(field => field.fieldNode)),
      },
      fieldDef,
    };
  } else {
    return { scope, fieldNode, fieldDef };
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
    selections: mergeFieldNodeSelectionSets(selections),
  };
}

function mergeFieldNodeSelectionSets(
  selectionNodes: SelectionNode[],
): SelectionNode[] {
  const [fieldNodes, fragmentNodes] = partition(
    selectionNodes,
    (node): node is FieldNode => node.kind === Kind.FIELD,
  );

  const [aliasedFieldNodes, nonAliasedFieldNodes] = partition(
    fieldNodes,
    node => !!node.alias,
  );

  const mergedFieldNodes = Array.from(
    groupBy((node: FieldNode) => node.name.value)(
      nonAliasedFieldNodes,
    ).values(),
  ).map((nodesWithSameName) => {
    const node = { ...nodesWithSameName[0] };
    if (node.selectionSet) {
      node.selectionSet = {
        ...node.selectionSet,
        selections: mergeFieldNodeSelectionSets(
          nodesWithSameName.flatMap(
            (node) => node.selectionSet?.selections || [],
          ),
        ),
      };
    }
    return node;
  });

  return [...mergedFieldNodes, ...aliasedFieldNodes, ...fragmentNodes];
}
