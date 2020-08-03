  import {
  FragmentDefinitionNode,
  GraphQLSchema,
  OperationDefinitionNode,
  Kind,
  SelectionNode as GraphQLJSSelectionNode
} from 'graphql';
import { QueryPlan as OldQueryPlan } from './QueryPlan';

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

export function serializeQueryPlanNode (k: string , v: any) {
  switch(k){
    case "selectionSet":
    case "internalFragments":
    case "loc":
    case "arguments":
    case "directives":
    case "source":
      return undefined;
    case "kind":
      if(v === Kind.SELECTION_SET) return undefined;
      return v;
    case "variableUsages":
      // TODO check this
      return Object.keys(v);
    case "typeCondition":
      return v.name.value;
    case "name":
      return v.value;
    case "requires":
      return v?.selections;
    default:
      // replace source with operation
      if(v?.kind === "Fetch"){
        return { ...v, operation: v.source };
      }
      // replace selectionSet with selections[]
      if(v?.kind === Kind.INLINE_FRAGMENT){
        return { ...v, selections: v.selectionSet.selections }
      }
      return v;
  }
}

export function transformQueryPlan(queryPlan: OldQueryPlan): QueryPlan {
  return JSON.parse(JSON.stringify(queryPlan, serializeQueryPlanNode));
}

// todo: move this back to utils/graphql. See note in executeQueryPlan.ts
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
