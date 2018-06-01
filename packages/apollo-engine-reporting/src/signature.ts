// XXX maybe this should just be its own graphql-signature package

import { sortBy, ListIteratee } from 'lodash';

import {
  print,
  visit,
  DocumentNode,
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
  separateOperations,
} from 'graphql';

// XXX doc
export function hideLiterals(ast: DocumentNode): DocumentNode {
  return visit(ast, {
    IntValue(node: IntValueNode): IntValueNode {
      return { ...node, value: '0' };
    },
    FloatValue(node: FloatValueNode): FloatValueNode {
      return { ...node, value: '0' };
    },
    StringValue(node: StringValueNode): StringValueNode {
      return { ...node, value: '', block: false };
    },
    ListValue(node: ListValueNode): ListValueNode {
      return { ...node, values: [] };
    },
    ObjectValue(node: ObjectValueNode): ObjectValueNode {
      return { ...node, fields: [] };
    },
  });
}

// XXX doc
export function dropUnusedDefinitions(
  ast: DocumentNode,
  operationName: string,
): DocumentNode {
  const separated = separateOperations(ast)[operationName];
  if (!separated) {
    // If the given operationName isn't found, just make this whole transform a
    // no-op instead of crashing.
    return ast;
  }
  return separated;
}

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

// XXX doc
export function sortAST(ast: DocumentNode): DocumentNode {
  return visit(ast, {
    OperationDefinition(
      node: OperationDefinitionNode,
    ): OperationDefinitionNode {
      return {
        ...node,
        variableDefinitions: sorted(
          node.variableDefinitions,
          'variable.name.value',
        ),
      };
    },
    SelectionSet(node: SelectionSetNode): SelectionSetNode {
      return {
        ...node,
        // Define an ordering for field names in a SelectionSet.  Field first,
        // then FragmentSpread, then InlineFragment.  By a lovely coincidence,
        // the order we want them to appear in is alphabetical by node.kind.
        // Use sortBy instead of sorted because 'selections' is not optional.
        selections: sortBy(node.selections, 'kind', 'name.value'),
      };
    },
    Field(node: FieldNode): FieldNode {
      return {
        ...node,
        arguments: sorted(node.arguments, 'name.value'),
      };
    },
    FragmentSpread(node: FragmentSpreadNode): FragmentSpreadNode {
      return { ...node, directives: sorted(node.directives, 'name.value') };
    },
    InlineFragment(node: InlineFragmentNode): InlineFragmentNode {
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
  });
}

// XXX doc
export function removeAliases(ast: DocumentNode): DocumentNode {
  return visit(ast, {
    Field(node: FieldNode): FieldNode {
      return {
        ...node,
        alias: undefined,
      };
    },
  });
}

// XXX doc
export function printWithReducedWhitespace(ast: DocumentNode): string {
  // In a GraphQL AST (which notably does not contain comments), the only place
  // where meaningful whitespace (or double quotes) can exist is in
  // StringNodes. So to print with reduced whitespace, we:
  // - temporarily sanitize strings by replacing their contents with hex
  // - use the default GraphQL printer
  // - minimize the whitespace with a simple regexp replacement
  // - convert strings back to their actual value
  // We normalize all strings to non-block strings for simplicity.

  const sanitizedAST = visit(ast, {
    StringValue(node: StringValueNode): StringValueNode {
      return {
        ...node,
        value: Buffer.from(node.value, 'utf8').toString('hex'),
        block: false,
      };
    },
  });
  const withWhitespace = print(sanitizedAST);
  const minimizedButStillHex = withWhitespace
    .replace(/\s+/g, ' ')
    .replace(/([^_a-zA-Z0-9]) /g, (_, c) => c)
    .replace(/ ([^_a-zA-Z0-9])/g, (_, c) => c);
  return minimizedButStillHex.replace(/"([a-f0-9]+)"/g, (_, hex) =>
    JSON.stringify(Buffer.from(hex, 'hex').toString('utf8')),
  );
}

// XXX doc
// XXX consider caching somehow
export function defaultSignature(
  ast: DocumentNode,
  operationName: string,
): string {
  return printWithReducedWhitespace(dropUnusedDefinitions(ast, operationName));
}
