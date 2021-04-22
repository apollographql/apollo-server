import { DurationHistogram } from './durationHistogram';
import {
  IFieldStat,
  IPathErrorStats,
  IQueryLatencyStats,
  IStatsContext,
  Trace,
  ITypeStat,
  IContextualizedStats,
  ReportHeader,
  google,
  ITracesAndStats,
  IReport,
} from 'apollo-reporting-protobuf';
import { iterateOverTrace, ResponseNamePath } from './iterateOverTrace';

// protobuf.js exports both a class and an interface (starting with I) for each
// message type. The class is what it produces when it decodes the message; the
// interface is what is accepted as input. We build up our messages using custom
// types implementing the interfaces, so that we can take advantage of the
// js_use_toArray option we added to our protobuf.js fork which allows us to use
// classes like DurationHistogram to generate repeated fields. We end up
// re-creating most of the report structure as custom classes (starting with
// "Our"). TypeScript validates that we've properly listed all of the message
// fields with the appropriate types (we use `Required` to ensure we implement
// all message fields). Using our own classes has other advantages, like being
// able to specify that nested messages are instances of the same class rather
// than the interface type and thus that they have non-null fields (because the
// interface type allows all fields to be optional, even though the protobuf
// format doesn't differentiate between missing and falsey).

export class OurReport implements Required<IReport> {
  constructor(readonly header: ReportHeader) {}
  readonly tracesPerQuery: Record<string, OurTracesAndStats> = Object.create(
    null,
  );
  public endTime: google.protobuf.ITimestamp | null = null;

  public tracesAndStatsByStatsReportKey(statsReportKey: string) {
    const existing = this.tracesPerQuery[statsReportKey];
    if (existing) {
      return existing;
    }
    return (this.tracesPerQuery[statsReportKey] = new OurTracesAndStats());
  }
}

class OurTracesAndStats implements Required<ITracesAndStats> {
  readonly trace: Uint8Array[] = [];
  readonly statsWithContext = new StatsByContext();
}

class StatsByContext {
  readonly map: { [k: string]: OurContextualizedStats } = Object.create(null);

  /**
   * This function is used by the protobuf generator to convert this map into
   * an array of contextualized stats to serialize
   */
  public toArray(): IContextualizedStats[] {
    return Object.values(this.map);
  }

  public addTrace(trace: Trace) {
    const statsContext: IStatsContext = {
      clientName: trace.clientName,
      clientVersion: trace.clientVersion,
      clientReferenceId: trace.clientReferenceId,
    };

    const statsContextKey = JSON.stringify(statsContext);

    // FIXME: Make this impact ReportData.size so that maxUncompressedReportSize
    // works.
    (
      this.map[statsContextKey] ||
      (this.map[statsContextKey] = new OurContextualizedStats(statsContext))
    ).addTrace(trace);
  }
}

export class OurContextualizedStats implements IContextualizedStats {
  queryLatencyStats = new OurQueryLatencyStats();
  perTypeStat: { [k: string]: OurTypeStat } = Object.create(null);

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

    const traceNodeStats = (node: Trace.INode, path: ResponseNamePath) => {
      // Generate error stats and error path information
      if (node.error?.length) {
        hasError = true;

        let currPathErrorStats = this.queryLatencyStats.rootErrorStats;
        path.toArray().forEach((subPath) => {
          const children = currPathErrorStats.children;
          currPathErrorStats =
            children[subPath] || (children[subPath] = new OurPathErrorStats());
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
          (this.perTypeStat[node.parentType] = new OurTypeStat());

        const fieldStat =
          typeStat.perFieldStat[fieldName] ||
          (typeStat.perFieldStat[fieldName] = new OurFieldStat(node.type));

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

    iterateOverTrace(trace, traceNodeStats, true);
    if (hasError) {
      this.queryLatencyStats.requestsWithErrorsCount++;
    }
  }
}

class OurQueryLatencyStats implements Required<IQueryLatencyStats> {
  latencyCount: DurationHistogram = new DurationHistogram();
  requestCount: number = 0;
  cacheHits: number = 0;
  persistedQueryHits: number = 0;
  persistedQueryMisses: number = 0;
  cacheLatencyCount: DurationHistogram = new DurationHistogram();
  rootErrorStats: OurPathErrorStats = new OurPathErrorStats();
  requestsWithErrorsCount: number = 0;
  publicCacheTtlCount: DurationHistogram = new DurationHistogram();
  privateCacheTtlCount: DurationHistogram = new DurationHistogram();
  registeredOperationCount: number = 0;
  forbiddenOperationCount: number = 0;
}

class OurPathErrorStats implements Required<IPathErrorStats> {
  children: { [k: string]: OurPathErrorStats } = Object.create(null);
  errorsCount: number = 0;
  requestsWithErrorsCount: number = 0;
}

class OurTypeStat implements Required<ITypeStat> {
  perFieldStat: { [k: string]: OurFieldStat } = Object.create(null);
}

class OurFieldStat implements Required<IFieldStat> {
  errorsCount: number = 0;
  count: number = 0;
  requestsWithErrorsCount: number = 0;
  latencyCount: DurationHistogram = new DurationHistogram();

  constructor(public readonly returnType: string) {}
}
