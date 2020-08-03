import { ASTNode, print, Kind, visit } from 'graphql';
import { Plugin, Config, Refs } from 'pretty-format';
import { SelectionNode } from '../QueryPlan';
import { SelectionNode as GraphQLJSSelectionNode } from 'graphql';

export default {
  test(value: any) {
    return value && typeof value.kind === 'string';
  },

  serialize(
    value: ASTNode,
    _config: Config,
    indentation: string,
    _depth: number,
    _refs: Refs,
    _printer: any,
  ): string {
    return print(addTypeConditionsToASTNodes(value))
      .trim()
      .replace(/\n/g, '\n' + indentation);
  },
} as Plugin;

// some inline fragment nodes have typeConditions which are strings
// for those, we need to add a full typeCondition AST node so the graphql
// printer can handle it
export function addTypeConditionsToASTNodes(node: ASTNode): ASTNode {
  return visit(node, {
    InlineFragment: (fragmentNode) => {
      // if the fragmentNode is already a proper graphql AST Node, return it
      if(fragmentNode.selectionSet) return fragmentNode;

      // if the fragmentNode is a QueryPlan FragmentNode, convert it to graphql
      return({
        kind: Kind.INLINE_FRAGMENT,
        typeCondition: fragmentNode.typeCondition ? {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: fragmentNode.typeCondition
          }
        }: undefined,
        selectionSet: {
          kind: Kind.SELECTION_SET,
          // we have to recursively rebuild the selectionSet using selections
          // to print it back using the graphql printer
          selections: remapSelections((fragmentNode as any).selections)
        },
      })
    }
  })
}

function remapSelections(selections: SelectionNode[]): ReadonlyArray<GraphQLJSSelectionNode>{
  return selections.map(selection =>
    {
      switch(selection.kind){
        case Kind.FIELD:
          return {
            kind: Kind.FIELD,
            name: {
              kind: Kind.NAME,
              value: selection.name
            },
            selectionSet: {
              kind: Kind.SELECTION_SET,
              selections: remapSelections(selection.selections || [])
            }
          }
        case Kind.INLINE_FRAGMENT:
          return {
            kind: Kind.INLINE_FRAGMENT,
            selectionSet: {
              kind: Kind.SELECTION_SET,
              selections: remapSelections(selection.selections || [])
            },
            typeCondition: selection.typeCondition ? {
              kind: Kind.NAMED_TYPE,
              name: {
                kind: Kind.NAME,
                value: selection.typeCondition
              }
            }: undefined
          }
      }
    }
  )
}
