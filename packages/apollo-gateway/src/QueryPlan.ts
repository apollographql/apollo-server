  import {
  FragmentDefinitionNode,
  GraphQLSchema,
  OperationDefinitionNode,
  Kind,
  SelectionNode as GraphQLJSSelectionNode
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

export const trimSelectionNodes = (selections: readonly GraphQLJSSelectionNode[]): SelectionNode[] => {
  let remapped: SelectionNode[] = [];

  // intentionally leaving out fragment spread from the input selections, because I don't
  // THINK that's possible to see in the final query plan -- prove me wrong
  selections.map(selection => {
    if(selection.kind === Kind.FIELD){
      remapped.push({
        kind: Kind.FIELD,
        name: selection.name.value,
        selections: selection.selectionSet ? trimSelectionNodes(selection.selectionSet?.selections) : undefined
      });
    }
    if(selection.kind === Kind.INLINE_FRAGMENT){
      remapped.push({
        kind: Kind.INLINE_FRAGMENT,
        typeCondition: selection.typeCondition?.name.value,
        selections: trimSelectionNodes(selection.selectionSet?.selections)
      });
    }
  })

  return remapped;
}
