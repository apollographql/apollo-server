import type { Trace } from 'apollo-reporting-protobuf';

/**
 * Iterates over the entire trace, calling `f` on each Trace.Node found. It
 * looks under the "root" node as well as any inside the query plan. If any `f`
 * returns true, it stops walking the tree.
 *
 * Each call to `f` will receive an object that implements ResponseNamePath. If
 * `includePath` is true, `f` can call `toArray()` on it to convert the
 * linked-list representation to an array of the response name (field name)
 * nodes that you navigate to get to the node (including a "service:subgraph"
 * top-level node if this is a federated trace). Note that we don't add anything
 * to the path for index (list element) nodes. This is because the only use case
 * we have (error path statistics) does not care about list indexes (it's not
 * that interesting to know that sometimes an error was at foo.3.bar and
 * sometimes foo.5.bar, vs just generally foo.bar).
 *
 * If `includePath` is false, we don't bother to build up the linked lists, and
 * calling `toArray()` will throw.
 */
export function iterateOverTrace(
  trace: Trace,
  f: (node: Trace.INode, path: ResponseNamePath) => boolean,
  includePath: boolean,
) {
  const rootPath = includePath
    ? new RootCollectingPathsResponseNamePath()
    : notCollectingPathsResponseNamePath;
  if (trace.root) {
    if (iterateOverTraceNode(trace.root, rootPath, f)) return;
  }

  if (trace.queryPlan) {
    if (iterateOverQueryPlan(trace.queryPlan, rootPath, f)) return;
  }
}

// Helper for iterateOverTrace; returns true to stop the overall walk.
function iterateOverQueryPlan(
  node: Trace.IQueryPlanNode,
  rootPath: ResponseNamePath,
  f: (node: Trace.INode, path: ResponseNamePath) => boolean,
): boolean {
  if (!node) return false;

  if (node.fetch?.trace?.root && node.fetch.serviceName) {
    return iterateOverTraceNode(
      node.fetch.trace.root,
      rootPath.child(`service:${node.fetch.serviceName}`),
      f,
    );
  }
  if (node.flatten?.node) {
    return iterateOverQueryPlan(node.flatten.node, rootPath, f);
  }
  if (node.parallel?.nodes) {
    // We want to stop as soon as some call returns true, which happens to be
    // exactly what 'some' does.
    return node.parallel.nodes.some((node) =>
      iterateOverQueryPlan(node, rootPath, f),
    );
  }
  if (node.sequence?.nodes) {
    // We want to stop as soon as some call returns true, which happens to be
    // exactly what 'some' does.
    return node.sequence.nodes.some((node) =>
      iterateOverQueryPlan(node, rootPath, f),
    );
  }

  return false;
}

// Helper for iterateOverTrace; returns true to stop the overall walk.
function iterateOverTraceNode(
  node: Trace.INode,
  path: ResponseNamePath,
  f: (node: Trace.INode, path: ResponseNamePath) => boolean,
): boolean {
  // Invoke the function; if it returns true, don't descend and tell callers to
  // stop walking.
  if (f(node, path)) {
    return true;
  }

  return (
    // We want to stop as soon as some call returns true, which happens to be
    // exactly what 'some' does.
    node.child?.some((child) => {
      const childPath = child.responseName
        ? path.child(child.responseName)
        : path;
      return iterateOverTraceNode(child, childPath, f);
    }) ?? false
  );
}

export interface ResponseNamePath {
  toArray(): string[];
  child(responseName: string): ResponseNamePath;
}

const notCollectingPathsResponseNamePath: ResponseNamePath = {
  toArray() {
    throw Error('not collecting paths!');
  },
  child() {
    return this;
  },
};

type CollectingPathsResponseNamePath =
  | RootCollectingPathsResponseNamePath
  | ChildCollectingPathsResponseNamePath;
class RootCollectingPathsResponseNamePath implements ResponseNamePath {
  toArray() {
    return [];
  }
  child(responseName: string) {
    return new ChildCollectingPathsResponseNamePath(responseName, this);
  }
}
class ChildCollectingPathsResponseNamePath implements ResponseNamePath {
  constructor(
    readonly responseName: string,
    readonly prev: CollectingPathsResponseNamePath,
  ) {}
  toArray() {
    const out = [];
    let curr: CollectingPathsResponseNamePath = this;
    while (curr instanceof ChildCollectingPathsResponseNamePath) {
      out.push(curr.responseName);
      curr = curr.prev;
    }
    return out.reverse();
  }
  child(responseName: string) {
    return new ChildCollectingPathsResponseNamePath(responseName, this);
  }
}
