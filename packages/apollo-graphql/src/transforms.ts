import { visit } from 'graphql/language/visitor';
import {
  DocumentNode,
  FloatValueNode,
  IntValueNode,
  StringValueNode,
  OperationDefinitionNode,
  SelectionSetNode,
  FragmentSpreadNode,
  InlineFragmentNode,
  DirectiveNode,
  FieldNode,
  FragmentDefinitionNode,
  ObjectValueNode,
  ListValueNode,
} from 'graphql/language/ast';
import { print } from 'graphql/language/printer';
import { separateOperations } from 'graphql/utilities';
// We'll only fetch the `ListIteratee` type from the `@types/lodash`, but get
// `sortBy` from the modularized version of the package to avoid bringing in
// all of `lodash`.
import { ListIteratee } from 'lodash';
import sortBy from 'lodash.sortby';

// Replace numeric, string, list, and object literals with "empty"
// values. Leaves enums alone (since there's no consistent "zero" enum). This
// can help combine similar queries if you substitute values directly into
// queries rather than use GraphQL variables, and can hide sensitive data in
// your query (say, a hardcoded API key) from Engine servers, but in general
// avoiding those situations is better than working around them.
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

// In the same spirit as the similarly named `hideLiterals` function, only
// hide string and numeric literals.
export function hideStringAndNumericLiterals(ast: DocumentNode): DocumentNode {
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
  });
}

// A GraphQL query may contain multiple named operations, with the operation to
// use specified separately by the client. This transformation drops unused
// operations from the query, as well as any fragment definitions that are not
// referenced.  (In general we recommend that unused definitions are dropped on
// the client before sending to the server to save bandwidth and parsing time.)
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

// Like lodash's sortBy, but sorted(undefined) === undefined rather than []. It
// is a stable non-in-place sort.
function sorted<T>(
  items: ReadonlyArray<T> | undefined,
  ...iteratees: Array<ListIteratee<T>>
): Array<T> | undefined {
  if (items) {
    return sortBy(items, ...iteratees);
  }
  return undefined;
}

// sortAST sorts most multi-child nodes alphabetically. Using this as part of
// your signature calculation function may make it easier to tell the difference
// between queries that are similar to each other, and if for some reason your
// GraphQL client generates query strings with elements in nondeterministic
// order, it can make sure the queries are treated as identical.
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

// removeAliases gets rid of GraphQL aliases, a feature by which you can tell a
// server to return a field's data under a different name from the field
// name. Maybe this is useful if somebody somewhere inserts random aliases into
// their queries.
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

// Like the graphql-js print function, but deleting whitespace wherever
// feasible. Specifically, all whitespace (outside of string literals) is
// reduced to at most one space, and even that space is removed anywhere except
// for between two alphanumerics.
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
