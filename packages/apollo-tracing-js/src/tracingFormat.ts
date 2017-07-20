import { 
  ResponsePath,
  responsePathAsArray
} from 'graphql';

import { 
  TraceCollector,
  ResolverCall,
  HighResolutionTime
} from './instrumentation';

export interface TracingFormat {
  version: 1,
  startTime: string,
  endTime: string,
  duration: number,
  execution: {
    resolvers: {
      path: (string | number)[],
      parentType: string,
      fieldName: string,
      returnType: string,
      startOffset: number,
      duration: number
    }[]
  }
}

export function formatTraceData(traceCollector: TraceCollector): TracingFormat {
  return {
    "version": 1,
    "startTime": traceCollector.startWallTime.toISOString(),
    "endTime": traceCollector.endWallTime.toISOString(),
    "duration": durationHrTimeToNanos(traceCollector.duration),
    "execution": {
      "resolvers": formatResolverCalls(traceCollector.resolverCalls)
    }
  }
}

function formatResolverCalls(resolverCalls: ResolverCall[]) {
  return resolverCalls.map(resolverCall => {
    const startOffset = durationHrTimeToNanos(resolverCall.startOffset);
    const duration = resolverCall.endOffset ? durationHrTimeToNanos(resolverCall.endOffset) - startOffset : 0;
    return {
      path: responsePathAsArray(resolverCall.path),
      parentType: resolverCall.parentType.toString(),
      fieldName: resolverCall.fieldName,
      returnType: resolverCall.returnType.toString(),
      startOffset,
      duration,
    }
  });
}

// Converts an hrtime array (as returned from process.hrtime) to nanoseconds.
//
// ONLY CALL THIS ON VALUES REPRESENTING DELTAS, NOT ON THE RAW RETURN VALUE
// FROM process.hrtime() WITH NO ARGUMENTS.
//
// The entire point of the hrtime data structure is that the JavaScript Number
// type can't represent all int64 values without loss of precision:
// Number.MAX_SAFE_INTEGER nanoseconds is about 104 days. Calling this function
// on a duration that represents a value less than 104 days is fine. Calling
// this function on an absolute time (which is generally roughly time since
// system boot) is not a good idea.
function durationHrTimeToNanos(hrtime: HighResolutionTime) {
  return (hrtime[0] * 1e9) + hrtime[1];
}
