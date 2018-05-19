import { sortBy, ListIteratee } from 'lodash';

import {
  visit,
  OperationDefinitionNode,
  SelectionSetNode,
  FieldNode,
  FragmentSpreadNode,
  InlineFragmentNode,
  FragmentDefinitionNode,
  DirectiveNode,
  IntValueNode,
  FloatValueNode,
  StringValueNode,
  ListValueNode,
  ObjectValueNode,
} from 'graphql';

function sorted<T>(
  items: ReadonlyArray<T> | undefined,
  ...iteratees: Array<ListIteratee<T>>
): Array<T> | undefined {
  if (items) {
    // This is a *stable* non-in-place sort.
    return sortBy(items, ...iteratees);
  }
  return undefined;
}

// XXX find the right operation and fragments
// XXX actually implement signature and tests for it

const signatureASTReducer = {
  OperationDefinition(node: OperationDefinitionNode):OperationDefinitionNode {
    return {
      ...node,
      variableDefinitions: sorted(
        node.variableDefinitions,
        'variable.name.value',
      ),
    };
  },

  // XXX SelectionSet, which has its own special ordering

  Field(node: FieldNode):FieldNode {
    return {
      ...node,
      arguments: sorted(node.arguments, 'name.value'),
      alias: undefined,
    };
  },
  FragmentSpread(node: FragmentSpreadNode):FragmentSpreadNode {
    return { ...node, directives: sorted(node.directives, 'name.value') };
  },
  InlineFragment(node: InlineFragmentNode):InlineFragmentNode {
    return { ...node, directives: sorted(node.directives, 'name.value') };
  },
  FragmentDefinition(node: FragmentDefinitionNode): FragmentDefinitionNode {
    return {
      ...node,
      directives: sorted(node.directives, 'name.value'),
      variableDefinitions: sorted(
        node.variableDefinitions,
        'variable.name.value',
      ),
    };
  },
  Directive(node: DirectiveNode): DirectiveNode {
    return { ...node, arguments: sorted(node.arguments, 'name.value') };
  },

  IntValue(node: IntValueNode): IntValueNode {
    return {...node, value: "0"};
  },
  FloatValue(node: FloatValueNode): FloatValueNode {
    return {...node, value: "0"};
  },
  StringValue(node: StringValueNode): StringValueNode {
    return {...node, value: "", block: false};
  },
  ListValue(node: ListValueNode): ListValueNode {
    return {...node, values: []};
  },
  ObjectValue(node: ObjectValueNode): ObjectValueNode {
    return {...node, fields: []};
  },
};
