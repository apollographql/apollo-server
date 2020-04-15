import { Trace } from 'apollo-engine-reporting-protobuf';
import { EngineReportingTreeBuilder } from './treeBuilder';
import { ApolloServerPlugin } from "apollo-server-plugin-base";
import { EngineReportingOptions } from "./agent";

type FederatedReportingOptions<TContext> = Pick<EngineReportingOptions<TContext>, 'rewriteError'>

const federatedPlugin = <TContext>(
  options: FederatedReportingOptions<TContext> = Object.create(null),
): ApolloServerPlugin<TContext> => {
  return {
    requestDidStart(requestContext) {
      const treeBuilder: EngineReportingTreeBuilder =
        new EngineReportingTreeBuilder({
          rewriteError: options.rewriteError,
        });

      // XXX Provide a mechanism to customize this logic.
      const http = requestContext.request.http;
      if (
        !http ||
        !http.headers ||
        http.headers.get('apollo-federation-include-trace') !== 'ftv1'
      ) {
        return;
      }

      treeBuilder.startTiming();

      return {
        willResolveField(...args) {
          const [ , , , info] = args;
          return treeBuilder.willResolveField(info);
        },

        didEncounterErrors({ errors }) {
          treeBuilder.didEncounterErrors(errors);
        },

        willSendResponse({ response }) {
          // We record the end time at the latest possible time: right before serializing the trace.
          // If we wait any longer, the time we record won't actually be sent anywhere!
          treeBuilder.stopTiming();

          const encodedUint8Array = Trace.encode(treeBuilder.trace).finish();
          const encodedBuffer = Buffer.from(
            encodedUint8Array,
            encodedUint8Array.byteOffset,
            encodedUint8Array.byteLength,
          );

          const extensions =
            response.extensions || (response.extensions = Object.create(null));

          if (typeof extensions.ftv1 !== "undefined") {
            throw new Error("The `ftv1` `extensions` were already present.");
          }

          extensions.ftv1 = encodedBuffer.toString('base64');
        }
      }
    },
  }
};

export default federatedPlugin;
