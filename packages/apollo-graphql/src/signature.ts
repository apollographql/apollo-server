// In Engine, we want to group requests making the same query together, and
// treat different queries distinctly. But what does it mean for two queries to
// be "the same"?  And what if you don't want to send the full text of the query
// to Apollo Engine's servers, either because it contains sensitive data or
// because it contains extraneous operations or fragments?
//
// To solve these problems, EngineReportingAgent has the concept of
// "signatures". We don't (by default) send the full query string of queries to
// the Engine servers. Instead, each trace has its query string's "signature".
//
// You can specify any function mapping a GraphQL query AST (DocumentNode) to
// string as your signature algorithm by providing it as the 'signature' option
// to the EngineReportingAgent constructor. Ideally, your signature should be a
// valid GraphQL query, though as of now the Engine servers do not re-parse your
// signature and do not expect it to match the execution tree in the trace.
//
// This module utilizes several AST transformations from the adjacent
// 'transforms' module (which are also for writing your own signature method).

// - dropUnusedDefinitions, which removes operations and fragments that
//   aren't going to be used in execution
// - hideLiterals, which replaces all numeric and string literals as well
//   as list and object input values with "empty" values
// - removeAliases, which removes field aliasing from the query
// - sortAST, which sorts the children of most multi-child nodes
//   consistently
// - printWithReducedWhitespace, a variant on graphql-js's 'print'
//   which gets rid of unneeded whitespace
//
// defaultSignature consists of applying all of these building blocks.
//
// Historical note: the default signature algorithm of the Go engineproxy
// performed all of the above operations, and the Engine servers then re-ran a
// mostly identical signature implementation on received traces. This was
// primarily to deal with edge cases where some users used literal interpolation
// instead of GraphQL variables, included randomized alias names, etc. In
// addition, the servers relied on the fact that dropUnusedDefinitions had been
// called in order (and that the signature could be parsed as GraphQL) to
// extract the name of the operation for display. This caused confusion, as the
// query document shown in the Engine UI wasn't the same as the one actually
// sent. apollo-engine-reporting uses a new reporting API which requires it to
// explicitly include the operation name with each signature; this means that
// the server no longer needs to parse the signature or run its own signature
// algorithm on it, and the details of the signature algorithm are now up to the
// reporting agent.

import { DocumentNode } from 'graphql';
import {
  printWithReducedWhitespace,
  dropUnusedDefinitions,
  removeAliases,
  sortAST,
  hideLiterals,
} from './transforms';

// The default signature function consists of removing unused definitions
// and whitespace.
// XXX consider caching somehow
export function defaultEngineReportingSignature(
  ast: DocumentNode,
  operationName: string,
): string {
  return printWithReducedWhitespace(
    sortAST(
      removeAliases(hideLiterals(dropUnusedDefinitions(ast, operationName))),
    ),
  );
}
