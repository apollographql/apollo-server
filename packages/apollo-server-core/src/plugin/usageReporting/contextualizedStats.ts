import { DurationHistogram } from './durationHistogram';
import {
  IFieldStat,
  IPathErrorStats,
  IQueryLatencyStats,
  IStatsContext,
  Trace,
  ITypeStat,
  IContextualizedStats,
} from 'apollo-reporting-protobuf';

// protobuf.js exports both a class and an interface (starting with I) for each
// message type. For these stats messages, we create our own classes that
// implement the interfaces, so that the `repeated sint64` DurationHistogram
// fields can be built up as DurationHistogram objects rather than arrays. (Our
// fork of protobuf.js contains a change
// (https://github.com/protobufjs/protobuf.js/pull/1302) which lets you use pass
// own objects with `toArray` methods to the generated protobuf encode
// functions.) TypeScript validates that we've properly listed all of the
// message fields with the appropriate types (we use `Required` to ensure we
// implement all message fields). Using our own classes has other advantages,
// like being able to specify that nested messages are instances of the same
// class rather than the interface type and thus that they have non-null fields
// (because the interface type allows all fields to be optional, even though the
// protobuf format doesn't differentiate between missing and falsey).
class QueryLatencyStats implements Required<IQueryLatencyStats> {
  latencyCount: DurationHistogram = new DurationHistogram();
  requestCount: number = 0;
  cacheHits: number = 0;
  persistedQueryHits: number = 0;
  persistedQueryMisses: number = 0;
  cacheLatencyCount: DurationHistogram = new DurationHistogram();
  rootErrorStats: PathErrorStats = new PathErrorStats();
  requestsWithErrorsCount: number = 0;
  publicCacheTtlCount: DurationHistogram = new DurationHistogram();
  privateCacheTtlCount: DurationHistogram = new DurationHistogram();
  registeredOperationCount: number = 0;
  forbiddenOperationCount: number = 0;
}

class PathErrorStats implements Required<IPathErrorStats> {
  children: { [k: string]: PathErrorStats } = Object.create(null);
  errorsCount: number = 0;
  requestsWithErrorsCount: number = 0;
}

class TypeStat implements Required<ITypeStat> {
  perFieldStat: { [k: string]: FieldStat } = Object.create(null);
}

class FieldStat implements Required<IFieldStat> {
  errorsCount: number = 0;
  count: number = 0;
  requestsWithErrorsCount: number = 0;
  latencyCount: DurationHistogram = new DurationHistogram();

  constructor(public readonly returnType: string) {}
}

export class ContextualizedStats implements IContextualizedStats {
  queryLatencyStats = new QueryLatencyStats();
  perTypeStat: { [k: string]: TypeStat } = Object.create(null);

  constructor(public readonly statsContext: IStatsContext) {}

  public addTrace(trace: Trace) {
    this.queryLatencyStats.requestCount++;
    if (trace.fullQueryCacheHit) {
      this.queryLatencyStats.cacheLatencyCount.incrementDuration(
        trace.durationNs,
      );
      this.queryLatencyStats.cacheHits++;
    } else {
      this.queryLatencyStats.latencyCount.incrementDuration(trace.durationNs);
    }

    // We only provide stats about cache TTLs on cache misses (ie, TTLs directly
    // calculated by the backend), not for cache hits. This matches the
    // behavior we've had for a while when converting traces into statistics
    // in Studio's servers.
    if (!trace.fullQueryCacheHit && trace.cachePolicy?.maxAgeNs != null) {
      // FIXME Actually write trace.cachePolicy!
      switch (trace.cachePolicy.scope) {
        case Trace.CachePolicy.Scope.PRIVATE:
          this.queryLatencyStats.privateCacheTtlCount.incrementDuration(
            trace.cachePolicy.maxAgeNs,
          );
          break;
        case Trace.CachePolicy.Scope.PUBLIC:
          this.queryLatencyStats.publicCacheTtlCount.incrementDuration(
            trace.cachePolicy.maxAgeNs,
          );
          break;
      }
    }

    if (trace.persistedQueryHit) {
      this.queryLatencyStats.persistedQueryHits++;
    }
    if (trace.persistedQueryRegister) {
      this.queryLatencyStats.persistedQueryMisses++;
    }

    if (trace.forbiddenOperation) {
      this.queryLatencyStats.forbiddenOperationCount++;
    }
    if (trace.registeredOperation) {
      this.queryLatencyStats.registeredOperationCount++;
    }

    let hasError = false;

    const traceNodeStats = (
      node: Trace.INode,
      pathWithoutNumbers: ReadonlyArray<string>,
    ) => {
      // Generate error stats and error path information
      if (node.error?.length) {
        hasError = true;

        let currPathErrorStats = this.queryLatencyStats.rootErrorStats;
        pathWithoutNumbers.forEach((subPath) => {
          const children = currPathErrorStats.children;
          currPathErrorStats =
            children[subPath] || (children[subPath] = new PathErrorStats());
        });

        currPathErrorStats.requestsWithErrorsCount += 1;
        currPathErrorStats.errorsCount += node.error.length;
      }

      // The actual field name behind the node; originalFieldName is set
      // if an alias was used, otherwise responseName. (This is falsey for
      // nodes that are not fields (root, array index, etc).)
      const fieldName = node.originalFieldName || node.responseName;

      // Protobuf doesn't really differentiate between "unset" and "falsey" so
      // we're mostly actually checking that these things are non-empty string /
      // non-zero numbers. The time fields represent the number of nanoseconds
      // since the beginning of the entire trace, so let's pretend for the
      // moment that it's plausible for a node to start or even end exactly when
      // the trace started (ie, for the time values to be 0). This is unlikely
      // in practice (everything should take at least 1ns). In practice we only
      // write `type` and `parentType` on a Node when we write `startTime`, so
      // the main thing we're looking out for by checking the time values is
      // whether we somehow failed to write `endTime` at the end of the field;
      // in this case, the `endTime >= startTime` check won't match.
      if (
        node.parentType &&
        fieldName &&
        node.type &&
        node.endTime != null &&
        node.startTime != null &&
        node.endTime >= node.startTime
      ) {
        const typeStat =
          this.perTypeStat[node.parentType] ||
          (this.perTypeStat[node.parentType] = new TypeStat());

        const fieldStat =
          typeStat.perFieldStat[fieldName] ||
          (typeStat.perFieldStat[fieldName] = new FieldStat(node.type));

        fieldStat.errorsCount += node.error?.length ?? 0;
        fieldStat.count++;
        // Note: this is actually counting the number of resolver calls for this
        // field that had at least one error, not the number of overall GraphQL
        // queries that had at least one error for this field. That doesn't seem
        // to match the name, but it does match the other implementations of this
        // logic.
        fieldStat.requestsWithErrorsCount +=
          (node.error?.length ?? 0) > 0 ? 1 : 0;
        fieldStat.latencyCount.incrementDuration(node.endTime - node.startTime);
      }

      return false;
    };

    iterateOverTraceForStats(trace, traceNodeStats);
    if (hasError) {
      this.queryLatencyStats.requestsWithErrorsCount++;
    }
  }
}

/**
 * Iterates over the entire trace, calling `f` on each Trace.Node found.
 * It looks under the "root" node as well as any inside the query plan.
 * If any `f` returns true, it stops walking the tree.
 */
function iterateOverTraceForStats(
  trace: Trace,
  f: (node: Trace.INode, pathWithoutNumbers: ReadonlyArray<string>) => boolean,
) {
  if (trace.root) {
    if (iterateOverTraceNode(trace.root, [], f)) return;
  }

  if (trace.queryPlan) {
    if (iterateOverQueryPlan(trace.queryPlan, f)) return;
  }
}

// Helper for iterateOverTraceForStats; returns true to stop the overall walk.
function iterateOverQueryPlan(
  node: Trace.IQueryPlanNode,
  f: (node: Trace.INode, pathWithoutNumbers: ReadonlyArray<string>) => boolean,
): boolean {
  if (!node) return false;

  if (node.fetch?.trace?.root && node.fetch.serviceName) {
    return iterateOverTraceNode(
      node.fetch.trace.root,
      [`service:${node.fetch.serviceName}`],
      f,
    );
  }
  if (node.flatten?.node) {
    return iterateOverQueryPlan(node.flatten.node, f);
  }
  if (node.parallel?.nodes) {
    // We want to stop as soon as some call returns true, which happens to be
    // exactly what 'some' does.
    return node.parallel.nodes.some((node) => iterateOverQueryPlan(node, f));
  }
  if (node.sequence?.nodes) {
    // We want to stop as soon as some call returns true, which happens to be
    // exactly what 'some' does.
    return node.sequence.nodes.some((node) => iterateOverQueryPlan(node, f));
  }

  return false;
}

// Helper for iterateOverTraceForStats; returns true to stop the overall walk.
function iterateOverTraceNode(
  node: Trace.INode,
  pathWithoutNumbers: ReadonlyArray<string>,
  f: (node: Trace.INode, pathWithoutNumbers: ReadonlyArray<string>) => boolean,
): boolean {
  // Invoke the function; if it returns true, don't descend and tell callers to
  // stop walking.
  if (f(node, pathWithoutNumbers)) {
    return true;
  }

  return (
    // We want to stop as soon as some call returns true, which happens to be
    // exactly what 'some' does.
    node.child?.some((child) => {
      let childpathWithoutNumbers = pathWithoutNumbers;
      if (child.responseName) {
        // concat creates a new shallow copy of the array
        // FIXME use a linked list
        childpathWithoutNumbers = pathWithoutNumbers.concat(child.responseName);
      }
      return iterateOverTraceNode(child, childpathWithoutNumbers, f);
    }) ?? false
  );
}

export function traceHasErrors(trace: Trace): boolean {
  let hasErrors = false;

  function traceNodeStats(node: Trace.INode): boolean {
    if ((node.error?.length ?? 0) > 0) {
      hasErrors = true;
    }
    return hasErrors;
  }

  iterateOverTraceForStats(trace, traceNodeStats);
  return hasErrors;
}
