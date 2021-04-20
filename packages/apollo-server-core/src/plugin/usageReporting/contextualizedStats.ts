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
  // Using our own class over codegen class since children is a
  // map of IPathErrorStats in codegen which throws typescript
  // errors when trying to traverse it since children can be null there.
  public children: { [k: string]: PathErrorStats } = Object.create(null);
  public errorsCount: number = 0;
  public requestsWithErrorsCount: number = 0;
}

class TypeStat implements Required<ITypeStat> {
  perFieldStat: { [k: string]: FieldStat } = Object.create(null);
}

class FieldStat implements Required<IFieldStat> {
  returnType: string;
  errorsCount: number = 0;
  count: number = 0;
  requestsWithErrorsCount: number = 0;
  latencyCount: DurationHistogram = new DurationHistogram();

  constructor(returnType: string) {
    this.returnType = returnType;
  }
}

export class ContextualizedStats implements IContextualizedStats {
  statsContext: IStatsContext;
  queryLatencyStats: QueryLatencyStats;
  perTypeStat: { [k: string]: TypeStat };

  constructor(statsContext: IStatsContext) {
    this.statsContext = statsContext;
    this.queryLatencyStats = new QueryLatencyStats();
    this.perTypeStat = Object.create(null);
  }

  public addTrace(trace: Trace) {
    const queryLatencyStats = this.queryLatencyStats;
    queryLatencyStats.requestCount++;
    if (trace.fullQueryCacheHit) {
      queryLatencyStats.cacheLatencyCount.incrementDuration(trace.durationNs);
      queryLatencyStats.cacheHits++;
    } else {
      queryLatencyStats.latencyCount.incrementDuration(trace.durationNs);
    }

    if (
      !trace.fullQueryCacheHit &&
      trace.cachePolicy?.maxAgeNs
      // FIXME Make sure this matches the Kotlin implementation (eg, handling
      // of maxAgeNs=0)
      // FIXME Actually write trace.cachePolicy!
      // FIXME consider using a `switch` while I'm at it
    ) {
      if (trace.cachePolicy.scope == Trace.CachePolicy.Scope.PRIVATE) {
        queryLatencyStats.privateCacheTtlCount.incrementDuration(
          trace.cachePolicy.maxAgeNs,
        );
      } else if (trace.cachePolicy.scope == Trace.CachePolicy.Scope.PUBLIC) {
        queryLatencyStats.publicCacheTtlCount.incrementDuration(
          trace.cachePolicy.maxAgeNs,
        );
      }
    }

    if (trace.persistedQueryHit) {
      queryLatencyStats.persistedQueryHits++;
    } else if (trace.persistedQueryRegister) {
      queryLatencyStats.persistedQueryMisses++;
    }

    if (trace.forbiddenOperation) {
      queryLatencyStats.forbiddenOperationCount++;
    } else if (trace.registeredOperation) {
      // FIXME confirm that in Kotlin this has no else and fix
      queryLatencyStats.registeredOperationCount++;
    }

    let hasError = false;
    const typeStats = this.perTypeStat;
    const rootPathErrorStats = queryLatencyStats.rootErrorStats;

    function traceNodeStats(node: Trace.INode, path: ReadonlyArray<string>) {
      // Generate error stats and error path information
      if (node.error?.length) {
        hasError = true;

        let currPathErrorStats = rootPathErrorStats;
        path.forEach((subPath) => {
          const children = currPathErrorStats.children;
          // FIXME Are we supposed to skip list indexes here and only actually
          // use field names? I think we looked into how the server handled this
          // today. Double check though!
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
          typeStats[node.parentType] ||
          (typeStats[node.parentType] = new TypeStat());

        const fieldStat =
          typeStat.perFieldStat[fieldName] ||
          (typeStat.perFieldStat[fieldName] = new FieldStat(node.type));

        fieldStat.errorsCount += node.error?.length ?? 0;
        fieldStat.count++;
        // Note: this is actually counting the number of resolver calls for this
        // field that had at least one error, not the number of overall GraphQL
        // queries that had at least one error for this field. That doesn't seem
        // to match the name, but it does match the Go engineproxy implementation.
        // (Well, actually the Go engineproxy implementation is even buggier because
        // it counts errors multiple times if multiple resolvers have the same path.)
        fieldStat.requestsWithErrorsCount +=
          (node.error?.length ?? 0) > 0 ? 1 : 0;
        fieldStat.latencyCount.incrementDuration(node.endTime - node.startTime);
      }

      return false;
    }

    iterateOverTraceForStats(trace, traceNodeStats);
    if (hasError) {
      queryLatencyStats.requestsWithErrorsCount++;
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
  f: (node: Trace.INode, path: ReadonlyArray<string>) => boolean,
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
  f: (node: Trace.INode, path: ReadonlyArray<string>) => boolean,
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
  path: ReadonlyArray<string>,
  f: (node: Trace.INode, path: ReadonlyArray<string>) => boolean,
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
      let childPath = path;
      if (child.responseName) {
        // concat creates a new shallow copy of the array
        childPath = path.concat(child.responseName);
      }
      return iterateOverTraceNode(child, childPath, f);
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
