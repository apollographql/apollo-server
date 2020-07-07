import {
  ApolloServerPlugin,
  GraphQLRequestListener
} from "apollo-server-plugin-base";
import { ApolloError } from "apollo-server-errors";
import { Kind, DefinitionNode, FieldNode, FragmentSpreadNode, InlineFragmentNode } from "graphql";
import { getLogger } from "loglevel";

interface Options {
  maxDepth?: number;
  debug?: boolean;
}

const logger = getLogger(`apollo-server:report-forbidden-operations-plugin`);

export default function DepthLimitingPlugin(options: Options = Object.create(null)) {
  if (options.debug) logger.enableAll();

  let maxDepth = options.maxDepth || 5;

  Object.freeze(options);

  return (): ApolloServerPlugin => ({
    requestDidStart(): GraphQLRequestListener<any> {
      return {
        executionDidStart({ document }) {
          let definitions = document.definitions;
          const fragments = getFragments(definitions);
          const queries = getQueriesAndMutations(definitions);
          const queryDepths = {};
          for (let name in queries) {
            queryDepths[name] = determineDepth(queries[name], fragments, 0, maxDepth, name, options);
          }

          if (options.debug)
            for (let query in queryDepths)
              logger.debug(`Operation ${query || "**UNNAMED**"} - Depth: ${queryDepths[query]}`);
        }
      }
    }
  });
}

function getFragments(definitions: readonly DefinitionNode[]): {} {
  return definitions.reduce((map, definition) => {
    if (definition.kind === Kind.FRAGMENT_DEFINITION) {
      map[definition.name.value] = definition
    }
    return map
  }, {});
}

// this will actually get both queries and mutations. we can basically treat those the same
function getQueriesAndMutations(definitions: readonly DefinitionNode[]): {} {
  return definitions.reduce((map, definition) => {
    if (definition.kind === Kind.OPERATION_DEFINITION) {
      map[definition.name ? definition.name.value : ''] = definition
    }
    return map
  }, {});
}

function determineDepth(node: DefinitionNode | FieldNode | FragmentSpreadNode | InlineFragmentNode, fragments, depthSoFar, maxDepth, operationName, options) {
  if (depthSoFar > maxDepth) {
    logger.debug(`'${operationName}' exceeds maximum operation depth of ${maxDepth}: ${depthSoFar}`);
    throw new ApolloError(`'${operationName}' exceeds maximum operation depth of ${maxDepth}: ${depthSoFar}`);
  }

  switch (node.kind) {
    case Kind.FIELD:
      if (!node.selectionSet || node.name.value === '__schema' || node.name.value === '__type') {
        return 0;
      }
      return 1 + Math.max(...node.selectionSet.selections.map(selection =>
        determineDepth(selection, fragments, depthSoFar + 1, maxDepth, operationName, options)
      ));
    case Kind.FRAGMENT_SPREAD:
      return determineDepth(fragments[node.name.value], fragments, depthSoFar, maxDepth, operationName, options);
    case Kind.INLINE_FRAGMENT:
    case Kind.FRAGMENT_DEFINITION:
    case Kind.OPERATION_DEFINITION:
      return Math.max(...node.selectionSet.selections.map(selection =>
        determineDepth(selection, fragments, depthSoFar, maxDepth, operationName, options)
      ));
    /* istanbul ignore next */
    default:
      logger.debug(`Unknown node.kind: ${node.kind}`);
      throw new Error('uh oh! depth crawler cannot handle: ' + node.kind);
  }
}