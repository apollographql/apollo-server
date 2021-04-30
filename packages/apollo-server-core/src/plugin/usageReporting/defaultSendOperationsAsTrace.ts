import LRUCache from 'lru-cache';
import type { Trace } from 'apollo-reporting-protobuf';
import { iterateOverTrace } from './iterateOverTrace';
import { DurationHistogram } from './durationHistogram';

export function defaultSendOperationsAsTrace() {
  // We keep an LRU cache mapping from a trace key (which consists of the
  // operation as defined by statsReportKey, the rough duration of the
  // operation, what minute the operation ended at, etc) to `true` if we've seen
  // it recently. We actually split this into one cache per minute so we can
  // throw away a full minute's worth of cache at once; we keep only the last
  // three minutes
  const cache = new LRUCache<string, true>({
    // 3MiB limit, very much approximately since we can't be sure how V8 might
    // be storing these strings internally. Though this should be enough to
    // store a fair amount of trace keys.

    // A future version of this might expose some
    // configuration option to grow the cache, but ideally, we could do that
    // dynamically based on the resources available to the server, and not add
    // more configuration surface area. Hopefully the warning message will allow
    // us to evaluate the need with more validated input from those that receive
    // it.
    max: Math.pow(2, 20),
    length: (_val, key) => {
      return (key && Buffer.byteLength(key)) || 0;
    },
  });

  return (trace: Trace, statsReportKey: string): boolean => {
    const endTimeSeconds = trace.endTime?.seconds;
    if (endTimeSeconds == null) {
      throw Error('programming error: endTime not set on trace');
    }

    const hasErrors = traceHasErrors(trace);
    const cacheKey = JSON.stringify([
      statsReportKey,
      DurationHistogram.durationToBucket(trace.durationNs),
      // What minute it started at
      Math.floor(endTimeSeconds / 60),
      // If the trace has an error, send one errored trace per 5 second interval
      // instead of the normal minutely bucket a non-errored trace takes.
      hasErrors ? Math.floor(endTimeSeconds / 5) : '',
    ]);

    // If we've already seen something roughly like this, don't send as a trace.
    if (cache.get(cacheKey)) {
      return false;
    }

    cache.set(cacheKey, true);
    return true;
  };
}

// Returns true if any node on the trace has errors. (If this ends up being a
// hot spot, we can precalculate it in TraceTreeBuilder.)
function traceHasErrors(trace: Trace): boolean {
  let hasErrors = false;

  function traceNodeStats(node: Trace.INode): boolean {
    if ((node.error?.length ?? 0) > 0) {
      hasErrors = true;
    }
    return hasErrors;
  }

  iterateOverTrace(trace, traceNodeStats, false);
  return hasErrors;
}
