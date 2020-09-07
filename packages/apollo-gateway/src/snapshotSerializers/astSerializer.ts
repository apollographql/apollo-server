import { ASTNode, print, Kind, visit } from 'graphql';
import { Plugin, Config, Refs } from 'pretty-format';
import { QueryPlanSelectionNode, QueryPlanInlineFragmentNode } from '../QueryPlan';
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
    return print(remapInlineFragmentNodes(value))
      .trim()
      .replace(/\n\n/g, '\n')
      .replace(/\n/g, '\n' + indentation);
  },
} as Plugin;

/**
 * This function converts potential InlineFragmentNodes that WE created
 * (defined in ../QueryPlan, not graphql-js) to GraphQL-js compliant AST nodes
 * for the graphql-js printer to work with
 *
 * The arg type here SHOULD be (node: AstNode | SelectionNode (from ../QueryPlan)),
 * but that breaks the graphql-js visitor, as it won't allow our redefined
 * SelectionNode to be passed in.
 *
 * Since our SelectionNode still has a `kind`, this will still functionally work
 * at runtime to call the InlineFragment visitor defined below
 *
 * We have to cast the `fragmentNode as unknown` and then to an InlineFragmentNode
 * at the bottom though, since there's no way to cast it appropriately to an
 * `InlineFragmentNode` as defined in ../QueryPlan.ts. TypeScript will complain
 * about there not being overlapping fields
 */
export function remapInlineFragmentNodes(node: ASTNode): ASTNode {
  return visit(node, {
    InlineFragment: (fragmentNode) => {
      // if the fragmentNode is already a proper graphql AST Node, return it
      if (fragmentNode.selectionSet) return fragmentNode;

      /**
       * Since the above check wasn't hit, we _know_ that fragmentNode is an
       * InlineFragmentNode from ../QueryPlan, but we can't actually type that
       * without causing ourselves a lot of headache, so we cast to unknown and
       * then to InlineFragmentNode (from ../QueryPlan) below
       */

      // if the fragmentNode is a QueryPlan InlineFragmentNode, convert it to graphql-js node
      return {
        kind: Kind.INLINE_FRAGMENT,
        typeCondition: fragmentNode.typeCondition
          ? {
              kind: Kind.NAMED_TYPE,
              name: {
                kind: Kind.NAME,
                value: fragmentNode.typeCondition,
              },
            }
          : undefined,
        selectionSet: {
          kind: Kind.SELECTION_SET,
          // we have to recursively rebuild the selectionSet using selections
          selections: remapSelections(
            ((fragmentNode as unknown) as QueryPlanInlineFragmentNode).selections,
          ),
        },
      };
    },
  });
}

function remapSelections(
  selections: QueryPlanSelectionNode[],
): ReadonlyArray<GraphQLJSSelectionNode> {
  return selections.map((selection) => {
    switch (selection.kind) {
      case Kind.FIELD:
        return {
          kind: Kind.FIELD,
          name: {
            kind: Kind.NAME,
            value: selection.name,
          },
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: remapSelections(selection.selections || []),
          },
        };
      case Kind.INLINE_FRAGMENT:
        return {
          kind: Kind.INLINE_FRAGMENT,
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: remapSelections(selection.selections || []),
          },
          typeCondition: selection.typeCondition
            ? {
                kind: Kind.NAMED_TYPE,
                name: {
                  kind: Kind.NAME,
                  value: selection.typeCondition,
                },
              }
            : undefined,
        };
    }
  });
}
