import { GraphQLResolveInfo, GraphQLError } from 'graphql';
import { GraphQLExtension } from 'graphql-extensions';
import { Trace } from 'apollo-engine-reporting-protobuf';
import { GraphQLRequestContext } from 'apollo-server-types';

import { EngineReportingTreeBuilder } from './treeBuilder';

export class EngineFederatedTracingExtension<TContext = any>
  implements GraphQLExtension<TContext> {
  private enabled = false;
  private done = false;
  private treeBuilder: EngineReportingTreeBuilder;

  public constructor(options: {
    rewriteError?: (err: GraphQLError) => GraphQLError | null;
  }) {
    this.treeBuilder = new EngineReportingTreeBuilder({
      rewriteError: options.rewriteError,
    });
  }

  public requestDidStart(o: {
    requestContext: GraphQLRequestContext<TContext>;
  }) {
    // XXX Provide a mechanism to customize this logic.
    const http = o.requestContext.request.http;
    if (
      http &&
      http.headers.get('apollo-federation-include-trace') === 'ftv1'
    ) {
      this.enabled = true;
    }

    if (this.enabled) {
      this.treeBuilder.startTiming();
    }
  }

  public willResolveField(
    _source: any,
    _args: { [argName: string]: any },
    _context: TContext,
    info: GraphQLResolveInfo,
  ): ((error: Error | null, result: any) => void) | void {
    if (this.enabled) {
      return this.treeBuilder.willResolveField(info);
    }
  }

  public didEncounterErrors(errors: GraphQLError[]) {
    if (this.enabled) {
      this.treeBuilder.didEncounterErrors(errors);
    }
  }

  // The ftv1 extension is a base64'd Trace protobuf containing only the
  // durationNs, startTime, endTime, and root fields.
  //
  // Note: format() is only called after executing an operation, and
  // specifically isn't called for parse or validation errors. Parse and validation
  // errors in a federated backend will get reported to the end user as a downstream
  // error but will not get reported to Engine (because Engine filters out downstream
  // errors)! See #3091.
  public format(): [string, string] | undefined {
    if (!this.enabled) {
      return;
    }
    if (this.done) {
      throw Error('format called twice?');
    }

    // We record the end time at the latest possible time: right before serializing the trace.
    // If we wait any longer, the time we record won't actually be sent anywhere!
    this.treeBuilder.stopTiming();
    this.done = true;

    const encodedUint8Array = Trace.encode(this.treeBuilder.trace).finish();
    const encodedBuffer = Buffer.from(
      encodedUint8Array,
      encodedUint8Array.byteOffset,
      encodedUint8Array.byteLength,
    );
    return ['ftv1', encodedBuffer.toString('base64')];
  }
}
