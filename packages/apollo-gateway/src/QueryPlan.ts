import {
  FragmentDefinitionNode,
  GraphQLSchema,
  OperationDefinitionNode,
  Kind,
  SelectionNode as GraphQLJSSelectionNode,
} from 'graphql';
import prettyFormat from 'pretty-format';
import { queryPlanSerializer, astSerializer } from './snapshotSerializers';

export type ResponsePath = (string | number)[];

export type FragmentMap = { [fragmentName: string]: FragmentDefinitionNode };

export type OperationContext = {
  schema: GraphQLSchema;
  operation: OperationDefinitionNode;
  fragments: FragmentMap;
};

export interface QueryPlan {
  kind: 'QueryPlan';
  node?: PlanNode;
}

export type PlanNode = SequenceNode | ParallelNode | FetchNode | FlattenNode;

export interface SequenceNode {
  kind: 'Sequence';
  nodes: PlanNode[];
}

export interface ParallelNode {
  kind: 'Parallel';
  nodes: PlanNode[];
}

export interface FetchNode {
  kind: 'Fetch';
  serviceName: string;
  variableUsages?: string[];
  requires?: SelectionNode[];
  operation: string;
}

export interface FlattenNode {
  kind: 'Flatten';
  path: ResponsePath;
  node: PlanNode;
}

export type SelectionNode = FieldNode | InlineFragmentNode;

export interface FieldNode {
  readonly kind: 'Field';
  readonly alias?: string;
  readonly name: string;
  readonly selections?: SelectionNode[];
}

export interface InlineFragmentNode {
  readonly kind: 'InlineFragment';
  readonly typeCondition?: string;
  readonly selections: SelectionNode[];
}

export function serializeQueryPlan(queryPlan: QueryPlan) {
  return prettyFormat(queryPlan, {
    plugins: [queryPlanSerializer, astSerializer],
  });
}

export function getResponseName(node: FieldNode): string {
  return node.alias ? node.alias : node.name;
}

/**
 * Converts a GraphQL-js SelectionNode to our newly defined SelectionNode
 *
 * This function is used to remove the unneeded pieces of a SelectionSet's
 * `.selections`. It is only ever called on a query plan's `requires` field,
 * so we can guarantee there won't be any FragmentSpreads passed in. That's why
 * we can ignore the case where `selection.kind === Kind.FRAGMENT_SPREAD`
 */
export const trimSelectionNodes = (
  selections: readonly GraphQLJSSelectionNode[],
): SelectionNode[] => {
  const remapped: SelectionNode[] = [];

  selections.map((selection) => {
    if (selection.kind === Kind.FIELD) {
      remapped.push({
        kind: Kind.FIELD,
        name: selection.name.value,
        selections:
          selection.selectionSet &&
          trimSelectionNodes(selection.selectionSet.selections),
      });
    }
    if (selection.kind === Kind.INLINE_FRAGMENT) {
      remapped.push({
        kind: Kind.INLINE_FRAGMENT,
        typeCondition: selection.typeCondition?.name.value,
        selections: trimSelectionNodes(selection.selectionSet.selections),
      });
    }
  });

  return remapped;
};
