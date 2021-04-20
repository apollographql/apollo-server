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

export class QueryLatencyStats implements IQueryLatencyStats {
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

export class PathErrorStats implements IPathErrorStats {
  // Using our own class over codegen class since children is a
  // map of IPathErrorStats in codegen which throws typescript
  // errors when trying to traverse it since children can be null there.
  public children: { [k: string]: PathErrorStats } = Object.create(null);
  public errorsCount: number = 0;
  public requestsWithErrorsCount: number = 0;
}

export class TypeStat implements ITypeStat {
  perFieldStat: { [k: string]: FieldStat } = Object.create(null);
}

export class FieldStat implements IFieldStat {
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

      if (
        node.parentType != null &&
        // FIXME originalFieldName is only for aliases, use reponseName too
        // (and when it's actually used below)
        node.originalFieldName != null &&
        node.type != null &&
        // FIXME is this ever actually null?
        node.endTime != null &&
        node.startTime != null
      ) {
        const typeStat =
          typeStats[node.parentType] ||
          (typeStats[node.parentType] = new TypeStat());

        const fieldStat =
          typeStat.perFieldStat[node.originalFieldName] ||
          (typeStat.perFieldStat[node.originalFieldName] = new FieldStat(
            node.type,
          ));

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
  node: Trace.IQueryPlanNode | null | undefined,
  f: (node: Trace.INode, path: ReadonlyArray<string>) => boolean,
): boolean {
  if (!node) return false;

  if (node.fetch?.trace?.root && node.fetch.serviceName !== null) {
    return iterateOverTraceNode(
      node.fetch.trace.root,
      [`service:${node.fetch.serviceName}`],
      f,
    );
  }
  if (node.flatten) {
    return iterateOverQueryPlan(node.flatten.node, f);
  }
  if (node.parallel?.nodes) {
    return node.parallel.nodes.some((node) => iterateOverQueryPlan(node, f));
  }
  if (node.sequence?.nodes) {
    return node.sequence.nodes.some((node) => iterateOverQueryPlan(node, f));
  }

  // Shouldn't happen, but keep going anyway.
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
