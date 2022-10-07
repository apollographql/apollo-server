import os from 'os';
import { gzip } from 'zlib';
import retry from 'async-retry';
import { Report, ReportHeader, Trace } from 'apollo-reporting-protobuf';
import { Response, fetch, Headers } from 'apollo-server-env';
import type {
  GraphQLRequestListener,
  GraphQLServerListener,
} from 'apollo-server-plugin-base';
import {
  CacheScope,
  GraphQLRequestContext,
  GraphQLServiceContext,
  GraphQLRequestContextDidResolveOperation,
  GraphQLRequestContextWillSendResponse,
  BaseContext,
} from 'apollo-server-types';
import {
  createOperationDerivedDataCache,
  OperationDerivedData,
  operationDerivedDataCacheKey,
} from './operationDerivedDataCache';
import { usageReportingSignature } from '@apollo/utils.usagereporting';
import type {
  ApolloServerPluginUsageReportingOptions,
  SendValuesBaseOptions,
} from './options';
import { dateToProtoTimestamp, TraceTreeBuilder } from '../traceTreeBuilder';
import { makeTraceDetails } from './traceDetails';
import { GraphQLSchema, printSchema } from 'graphql';
import { computeCoreSchemaHash } from '../schemaReporting';
import type { InternalApolloServerPlugin } from '../../internalPlugin';
import { OurReport } from './stats';
import { defaultSendOperationsAsTrace } from './defaultSendOperationsAsTrace';
import {
  calculateReferencedFieldsByType,
  ReferencedFieldsByType,
} from '@apollo/utils.usagereporting';
import type LRUCache from 'lru-cache';

const reportHeaderDefaults = {
  hostname: os.hostname(),
  agentVersion: `apollo-server-core@${
    require('../../../package.json').version
  }`,
  runtimeVersion: `node ${process.version}`,
  // XXX not actually uname, but what node has easily.
  uname: `${os.platform()}, ${os.type()}, ${os.release()}, ${os.arch()})`,
};

export function ApolloServerPluginUsageReporting<TContext extends BaseContext>(
  options: ApolloServerPluginUsageReportingOptions<TContext> = Object.create(
    null,
  ),
): InternalApolloServerPlugin {
  // Note: We'd like to change the default to false in Apollo Server 4, so that
  // the default usage reporting experience doesn't include *anything* that
  // could potentially be PII (like error messages) --- just operations and
  // numbers.
  const fieldLevelInstrumentationOption = options.fieldLevelInstrumentation;
  const fieldLevelInstrumentation =
    typeof fieldLevelInstrumentationOption === 'number'
      ? async () =>
          Math.random() < fieldLevelInstrumentationOption
            ? 1 / fieldLevelInstrumentationOption
            : 0
      : fieldLevelInstrumentationOption
      ? fieldLevelInstrumentationOption
      : async () => true;

  let requestDidStartHandler: (
    requestContext: GraphQLRequestContext<TContext>,
  ) => GraphQLRequestListener<TContext>;
  return {
    __internal_plugin_id__() {
      return 'UsageReporting';
    },

    // We want to be able to access locals from `serverWillStart` in our `requestDidStart`, thus
    // this little hack. (Perhaps we should also allow GraphQLServerListener to contain
    // a requestDidStart?)
    async requestDidStart(requestContext: GraphQLRequestContext<TContext>) {
      if (!requestDidStartHandler) {
        throw Error(
          'The usage reporting plugin has been asked to handle a request before the ' +
            'server has started. See https://github.com/apollographql/apollo-server/issues/4588 ' +
            'for more details.',
        );
      }
      return requestDidStartHandler(requestContext);
    },

    async serverWillStart({
      logger: serverLogger,
      apollo,
      serverlessFramework,
    }: GraphQLServiceContext): Promise<GraphQLServerListener> {
      // Use the plugin-specific logger if one is provided; otherwise the general server one.
      const logger = options.logger ?? serverLogger;
      const { key, graphRef } = apollo;
      if (!(key && graphRef)) {
        throw new Error(
          "You've enabled usage reporting via ApolloServerPluginUsageReporting, " +
            'but you also need to provide your Apollo API key and graph ref, via ' +
            'the APOLLO_KEY/APOLLO_GRAPH_REF environment ' +
            'variables or via `new ApolloServer({apollo: {key, graphRef})`.',
        );
      }

      logger.info(
        'Apollo usage reporting starting! See your graph at ' +
          `https://studio.apollographql.com/graph/${encodeURI(graphRef)}/`,
      );

      // If sendReportsImmediately is not specified, we default to true if we're running
      // with the ApolloServer designed for Lambda or similar. That's because these
      // environments aren't designed around letting us run a background task to
      // send reports later or hook into container destruction to flush buffered reports.
      const sendReportsImmediately =
        options.sendReportsImmediately ?? serverlessFramework;

      // Since calculating the signature and referenced fields for usage
      // reporting is potentially an expensive operation, we'll cache the data
      // we generate and re-use them for repeated operations for the same
      // `queryHash`. However, because referenced fields depend on the current
      // schema, we want to throw it out entirely any time the schema changes.
      let operationDerivedDataCache: {
        forSchema: GraphQLSchema;
        cache: LRUCache<string, OperationDerivedData>;
      } | null = null;

      // This map maps from executable schema ID (schema hash, basically) to the
      // report we'll send about it. That's because when we're using a gateway,
      // the schema can change over time, but each report needs to be about a
      // single schema. We avoid having this function be a memory leak by
      // removing values from it when we're in the process of sending reports.
      // That means we have to be very careful never to pull a Report out of it
      // and hang on to it for a while before writing to it, because the report
      // might have gotten sent and discarded in the meantime. So you should
      // only access the values of this Map via
      // getReportWhichMustBeUsedImmediately and getAndDeleteReport, and never
      // hang on to the value returned by getReportWhichMustBeUsedImmediately.
      const reportByExecutableSchemaId = new Map<string, OurReport>();
      const getReportWhichMustBeUsedImmediately = (
        executableSchemaId: string,
      ): OurReport => {
        const existing = reportByExecutableSchemaId.get(executableSchemaId);
        if (existing) {
          return existing;
        }
        const report = new OurReport(
          new ReportHeader({
            ...reportHeaderDefaults,
            executableSchemaId,
            graphRef,
          }),
        );
        reportByExecutableSchemaId.set(executableSchemaId, report);
        return report;
      };
      const getAndDeleteReport = (
        executableSchemaId: string,
      ): OurReport | null => {
        const report = reportByExecutableSchemaId.get(executableSchemaId);
        if (report) {
          reportByExecutableSchemaId.delete(executableSchemaId);
          return report;
        }
        return null;
      };

      const overriddenExecutableSchemaId = options.overrideReportedSchema
        ? computeCoreSchemaHash(options.overrideReportedSchema)
        : undefined;

      let lastSeenExecutableSchemaToId:
        | {
            executableSchema: GraphQLSchema;
            executableSchemaId: string;
          }
        | undefined;

      let reportTimer: NodeJS.Timer | undefined;
      if (!sendReportsImmediately) {
        reportTimer = setInterval(
          () => sendAllReportsAndReportErrors(),
          options.reportIntervalMs || 10 * 1000,
        );
      }

      let graphMightSupportTraces = true;
      const sendOperationAsTrace =
        options.experimental_sendOperationAsTrace ??
        defaultSendOperationsAsTrace();
      const includeTracesContributingToStats =
        options.internal_includeTracesContributingToStats ?? false;

      let stopped = false;

      function executableSchemaIdForSchema(schema: GraphQLSchema) {
        if (lastSeenExecutableSchemaToId?.executableSchema === schema) {
          return lastSeenExecutableSchemaToId.executableSchemaId;
        }
        const id = computeCoreSchemaHash(printSchema(schema));

        // We override this variable every time we get a new schema so we cache
        // the last seen value. It is a single-entry cache.
        lastSeenExecutableSchemaToId = {
          executableSchema: schema,
          executableSchemaId: id,
        };

        return id;
      }

      async function sendAllReportsAndReportErrors(): Promise<void> {
        await Promise.all(
          [...reportByExecutableSchemaId.keys()].map((executableSchemaId) =>
            sendReportAndReportErrors(executableSchemaId),
          ),
        );
      }

      async function sendReportAndReportErrors(
        executableSchemaId: string,
      ): Promise<void> {
        return sendReport(executableSchemaId).catch((err) => {
          // This catch block is primarily intended to catch network errors from
          // the retried request itself, which include network errors and non-2xx
          // HTTP errors.
          if (options.reportErrorFunction) {
            options.reportErrorFunction(err);
          } else {
            logger.error(err.message);
          }
        });
      }

      // Needs to be an arrow function to be confident that key is defined.
      const sendReport = async (executableSchemaId: string): Promise<void> => {
        const report = getAndDeleteReport(executableSchemaId);
        if (
          !report ||
          (Object.keys(report.tracesPerQuery).length === 0 &&
            report.operationCount === 0)
        ) {
          return;
        }

        // Set the report's overall end time. This is the timestamp that will be
        // associated with the summarized statistics.
        report.endTime = dateToProtoTimestamp(new Date());

        report.ensureCountsAreIntegers();

        const protobufError = Report.verify(report);
        if (protobufError) {
          throw new Error(`Error encoding report: ${protobufError}`);
        }
        const message = Report.encode(report).finish();

        // Potential follow-up: we can compare message.length to
        // report.sizeEstimator.bytes and use it to "learn" if our estimation is
        // off and adjust it based on what we learn.

        if (options.debugPrintReports) {
          // In terms of verbosity, and as the name of this option suggests,
          // this message is either an "info" or a "debug" level message.
          // However, we are using `warn` here for compatibility reasons since
          // the `debugPrintReports` flag pre-dated the existence of log-levels
          // and changing this to also require `debug: true` (in addition to
          // `debugPrintReports`) just to reach the level of verbosity to
          // produce the output would be a breaking change.  The "warn" level is
          // on by default.  There is a similar theory and comment applied
          // below.
          //
          // We decode the report rather than printing the original `report`
          // so that it includes all of the pre-encoded traces.
          const decodedReport = Report.decode(message);
          logger.warn(
            `Apollo usage report: ${JSON.stringify(decodedReport.toJSON())}`,
          );
        }

        const compressed = await new Promise<Buffer>((resolve, reject) => {
          // The protobuf library gives us a Uint8Array. Node 8's zlib lets us
          // pass it directly; convert for the sake of Node 6. (No support right
          // now for Node 4, which lacks Buffer.from.)
          const messageBuffer = Buffer.from(
            message.buffer as ArrayBuffer,
            message.byteOffset,
            message.byteLength,
          );
          gzip(messageBuffer, (err, gzipResult) => {
            if (err) {
              reject(err);
            } else {
              resolve(gzipResult);
            }
          });
        });

        // Wrap fetcher with async-retry for automatic retrying
        const fetcher = options.fetcher ?? fetch;
        const response: Response = await retry(
          // Retry on network errors and 5xx HTTP
          // responses.
          async () => {
            const curResponse = await fetcher(
              (options.endpointUrl ||
                'https://usage-reporting.api.apollographql.com') +
                '/api/ingress/traces',
              {
                method: 'POST',
                headers: {
                  'user-agent': 'ApolloServerPluginUsageReporting',
                  'x-api-key': key,
                  'content-encoding': 'gzip',
                  accept: 'application/json',
                },
                body: compressed,
                agent: options.requestAgent,
              },
            );

            if (curResponse.status >= 500 && curResponse.status < 600) {
              throw new Error(
                `HTTP status ${curResponse.status}, ${
                  (await curResponse.text()) || '(no body)'
                }`,
              );
            } else {
              return curResponse;
            }
          },
          {
            retries: (options.maxAttempts || 5) - 1,
            minTimeout: options.minimumRetryDelayMs || 100,
            factor: 2,
          },
        ).catch((err: Error) => {
          throw new Error(
            `Error sending report to Apollo servers: ${err.message}`,
          );
        });

        if (response.status < 200 || response.status >= 300) {
          // Note that we don't expect to see a 3xx here because request follows
          // redirects.
          throw new Error(
            `Error sending report to Apollo servers: HTTP status ${
              response.status
            }, ${(await response.text()) || '(no body)'}`,
          );
        }

        if (
          graphMightSupportTraces &&
          response.status === 200 &&
          response.headers
            .get('content-type')
            ?.match(/^\s*application\/json\s*(?:;|$)/i)
        ) {
          const body = await response.text();
          let parsedBody;
          try {
            parsedBody = JSON.parse(body);
          } catch (e) {
            throw new Error(`Error parsing response from Apollo servers: ${e}`);
          }
          if (parsedBody.tracesIgnored === true) {
            logger.debug(
              "This graph's organization does not have access to traces; sending all " +
                'subsequent operations as traces.',
            );
            graphMightSupportTraces = false;
            // XXX We could also parse traces that are already in the current
            // report and convert them to stats if we wanted?
          }
        }
        if (options.debugPrintReports) {
          // In terms of verbosity, and as the name of this option suggests, this
          // message is either an "info" or a "debug" level message.  However,
          // we are using `warn` here for compatibility reasons since the
          // `debugPrintReports` flag pre-dated the existence of log-levels and
          // changing this to also require `debug: true` (in addition to
          // `debugPrintReports`) just to reach the level of verbosity to produce
          // the output would be a breaking change.  The "warn" level is on by
          // default.  There is a similar theory and comment applied above.
          logger.warn(`Apollo usage report: status ${response.status}`);
        }
      };

      requestDidStartHandler = ({
        logger: requestLogger,
        metrics,
        schema,
        request: { http, variables },
      }): GraphQLRequestListener<TContext> => {
        // Request specific log output should go into the `logger` from the
        // request context when it's provided.
        const logger = requestLogger ?? options.logger ?? serverLogger;
        const treeBuilder: TraceTreeBuilder = new TraceTreeBuilder({
          rewriteError: options.rewriteError,
          logger,
        });
        treeBuilder.startTiming();
        metrics.startHrTime = treeBuilder.startHrTime;
        let graphqlValidationFailure = false;
        let graphqlUnknownOperationName = false;
        let includeOperationInUsageReporting: boolean | null = null;

        if (http) {
          treeBuilder.trace.http = new Trace.HTTP({
            method:
              Trace.HTTP.Method[
                http.method as keyof typeof Trace.HTTP.Method
              ] || Trace.HTTP.Method.UNKNOWN,
            // Host and path are not used anywhere on the backend, so let's not bother
            // trying to parse request.url to get them, which is a potential
            // source of bugs because integrations have different behavior here.
            // On Node's HTTP module, request.url only includes the path
            // (see https://nodejs.org/api/http.html#http_message_url)
            // The same is true on Lambda (where we pass event.path)
            // But on environments like Cloudflare we do get a complete URL.
            host: null,
            path: null,
          });

          if (options.sendHeaders) {
            makeHTTPRequestHeaders(
              treeBuilder.trace.http,
              http.headers,
              options.sendHeaders,
            );
          }
        }

        // After this function completes, includeOperationInUsageReporting is
        // defined.
        async function maybeCallIncludeRequestHook(
          requestContext:
            | GraphQLRequestContextDidResolveOperation<TContext>
            | GraphQLRequestContextWillSendResponse<TContext>,
        ): Promise<void> {
          // If this is the second call in `willSendResponse` after
          // `didResolveOperation`, we're done.
          if (includeOperationInUsageReporting !== null) return;

          if (typeof options.includeRequest !== 'function') {
            // Default case we always report
            includeOperationInUsageReporting = true;
            return;
          }
          includeOperationInUsageReporting = await options.includeRequest(
            requestContext,
          );

          // Help the user understand they've returned an unexpected value,
          // which might be a subtle mistake.
          if (typeof includeOperationInUsageReporting !== 'boolean') {
            logger.warn(
              "The 'includeRequest' async predicate function must return a boolean value.",
            );
            includeOperationInUsageReporting = true;
          }
        }

        // Our usage reporting groups everything by operation, so we don't
        // actually report about any issues that prevent us from getting an
        // operation string (eg, a missing operation, or APQ problems).
        // This is effectively bypassing the reporting of:
        //   - PersistedQueryNotFoundError
        //   - PersistedQueryNotSupportedError
        //   - Missing `query` error
        // We may want to report them some other way later!
        let didResolveSource: boolean = false;

        return {
          async didResolveSource(requestContext) {
            didResolveSource = true;

            if (metrics.persistedQueryHit) {
              treeBuilder.trace.persistedQueryHit = true;
            }
            if (metrics.persistedQueryRegister) {
              treeBuilder.trace.persistedQueryRegister = true;
            }

            if (variables) {
              treeBuilder.trace.details = makeTraceDetails(
                variables,
                options.sendVariableValues,
                requestContext.source,
              );
            }

            const clientInfo = (
              options.generateClientInfo || defaultGenerateClientInfo
            )(requestContext);
            if (clientInfo) {
              // While there is a clientAddress protobuf field, the backend
              // doesn't pay attention to it yet, so we'll ignore it for now.
              const { clientName, clientVersion } = clientInfo;
              treeBuilder.trace.clientVersion = clientVersion || '';
              treeBuilder.trace.clientName = clientName || '';
            }
          },
          async validationDidStart() {
            return async (validationErrors?: ReadonlyArray<Error>) => {
              graphqlValidationFailure = validationErrors
                ? validationErrors.length !== 0
                : false;
            };
          },
          async didResolveOperation(requestContext) {
            // If operation is undefined then `getOperationAST` returned null
            // and an unknown operation was specified.
            graphqlUnknownOperationName =
              requestContext.operation === undefined;
            await maybeCallIncludeRequestHook(requestContext);

            if (
              includeOperationInUsageReporting &&
              // No need to capture traces if the operation is going to
              // immediately fail due to unknown operation name.
              !graphqlUnknownOperationName
            ) {
              if (metrics.captureTraces === undefined) {
                // We're not completely ignoring the operation. But should we
                // calculate a detailed trace of every field while we do so (either
                // directly in this plugin, or in a subgraph by sending the
                // apollo-federation-include-trace header)? That will allow this
                // operation to contribute to the "field executions" column in the
                // Studio Fields page, to the timing hints in Explorer and
                // vscode-graphql, and to the traces visible under Operations. (Note
                // that `true` here does not imply that this operation will
                // necessarily be *sent* to the usage-reporting endpoint in the form
                // of a trace --- it still might be aggregated into stats first. But
                // capturing a trace will mean we can understand exactly what fields
                // were executed and what their performance was, at the tradeoff of
                // some overhead for tracking the trace (and transmitting it between
                // subgraph and gateway).
                const rawWeight = await fieldLevelInstrumentation(
                  requestContext,
                );
                treeBuilder.trace.fieldExecutionWeight =
                  typeof rawWeight === 'number' ? rawWeight : rawWeight ? 1 : 0;

                metrics.captureTraces =
                  !!treeBuilder.trace.fieldExecutionWeight;
              }
            }
          },
          async executionDidStart() {
            // If we're not capturing traces, don't return a willResolveField so
            // that we don't build up a detailed trace inside treeBuilder. (We still
            // will use treeBuilder as a convenient place to put top-level facts
            // about the operation which can end up aggregated as stats, and we do
            // eventually put *errors* onto the trace tree.)
            if (!metrics.captureTraces) return;

            return {
              willResolveField({ info }) {
                return treeBuilder.willResolveField(info);
                // We could save the error into the trace during the end handler, but
                // it won't have all the information that graphql-js adds to it later,
                // like 'locations'.
              },
            };
          },
          async willSendResponse(requestContext) {
            // Search above for a comment about "didResolveSource" to see which
            // of the pre-source-resolution errors we are intentionally avoiding.
            if (!didResolveSource) return;
            if (requestContext.errors) {
              treeBuilder.didEncounterErrors(requestContext.errors);
            }

            const resolvedOperation = !!requestContext.operation;

            // If we got an error before we called didResolveOperation (eg parse or
            // validation error), check to see if we should include the request.
            await maybeCallIncludeRequestHook(requestContext);

            treeBuilder.stopTiming();
            const executableSchemaId =
              overriddenExecutableSchemaId ??
              executableSchemaIdForSchema(schema);

            if (includeOperationInUsageReporting === false) {
              if (resolvedOperation)
                getReportWhichMustBeUsedImmediately(executableSchemaId)
                  .operationCount++;
              return;
            }

            treeBuilder.trace.fullQueryCacheHit = !!metrics.responseCacheHit;
            treeBuilder.trace.forbiddenOperation = !!metrics.forbiddenOperation;
            treeBuilder.trace.registeredOperation =
              !!metrics.registeredOperation;

            const policyIfCacheable =
              requestContext.overallCachePolicy.policyIfCacheable();
            if (policyIfCacheable) {
              treeBuilder.trace.cachePolicy = new Trace.CachePolicy({
                scope:
                  policyIfCacheable.scope === CacheScope.Private
                    ? Trace.CachePolicy.Scope.PRIVATE
                    : policyIfCacheable.scope === CacheScope.Public
                    ? Trace.CachePolicy.Scope.PUBLIC
                    : Trace.CachePolicy.Scope.UNKNOWN,
                // Convert from seconds to ns.
                maxAgeNs: policyIfCacheable.maxAge * 1e9,
              });
            }

            // If this was a federated operation and we're the gateway, add the query plan
            // to the trace.
            if (metrics.queryPlanTrace) {
              treeBuilder.trace.queryPlan = metrics.queryPlanTrace;
            }

            // Intentionally un-awaited so as not to block the response.  Any
            // errors will be logged, but will not manifest a user-facing error.
            // The logger in this case is a request specific logger OR the logger
            // defined by the plugin if that's unavailable.  The request-specific
            // logger is preferred since this is very much coupled directly to a
            // client-triggered action which might be more granularly tagged by
            // logging implementations.
            addTrace().catch(logger.error);

            async function addTrace(): Promise<void> {
              // Ignore traces that come in after stop().
              if (stopped) {
                return;
              }

              // Ensure that the caller of addTrace (which does not await it) is
              // not blocked. We use setImmediate rather than process.nextTick or
              // just relying on the Promise microtask queue because setImmediate
              // comes after IO, which is what we want.
              await new Promise((res) => setImmediate(res));

              const executableSchemaId =
                overriddenExecutableSchemaId ??
                executableSchemaIdForSchema(schema);

              const { trace } = treeBuilder;

              let statsReportKey: string | undefined = undefined;
              let referencedFieldsByType: ReferencedFieldsByType;
              if (!requestContext.document) {
                statsReportKey = `## GraphQLParseFailure\n`;
              } else if (graphqlValidationFailure) {
                statsReportKey = `## GraphQLValidationFailure\n`;
              } else if (graphqlUnknownOperationName) {
                statsReportKey = `## GraphQLUnknownOperationName\n`;
              }

              const isExecutable = statsReportKey === undefined;

              if (statsReportKey) {
                if (options.sendUnexecutableOperationDocuments) {
                  trace.unexecutedOperationBody = requestContext.source;
                  // Get the operation name from the request (which might not
                  // correspond to an actual operation).
                  trace.unexecutedOperationName =
                    requestContext.request.operationName || '';
                }
                referencedFieldsByType = Object.create(null);
              } else {
                const operationDerivedData = getOperationDerivedData();
                statsReportKey = `# ${requestContext.operationName || '-'}\n${
                  operationDerivedData.signature
                }`;
                referencedFieldsByType =
                  operationDerivedData.referencedFieldsByType;
              }

              const protobufError = Trace.verify(trace);
              if (protobufError) {
                throw new Error(`Error encoding trace: ${protobufError}`);
              }

              if (resolvedOperation) {
                getReportWhichMustBeUsedImmediately(executableSchemaId)
                  .operationCount++;
              }

              getReportWhichMustBeUsedImmediately(executableSchemaId).addTrace({
                statsReportKey,
                trace,
                // We include the operation as a trace (rather than aggregated
                // into stats) only if we believe it's possible that our
                // organization's plan allows for viewing traces *and* we
                // actually captured this as a full trace *and*
                // sendOperationAsTrace says so.
                //
                // (As an edge case, if the reason metrics.captureTraces is
                // falsey is that this is an unexecutable operation and thus we
                // never ran the code in didResolveOperation that sets
                // metrics.captureTrace, we allow it to be sent as a trace. This
                // means we'll still send some parse and validation failures as
                // traces, for the sake of the Errors page.)
                asTrace:
                  graphMightSupportTraces &&
                  (!isExecutable || !!metrics.captureTraces) &&
                  sendOperationAsTrace(trace, statsReportKey),
                includeTracesContributingToStats,
                referencedFieldsByType,
              });

              // If the buffer gets big (according to our estimate), send.
              if (
                sendReportsImmediately ||
                getReportWhichMustBeUsedImmediately(executableSchemaId)
                  .sizeEstimator.bytes >=
                  (options.maxUncompressedReportSize || 4 * 1024 * 1024)
              ) {
                await sendReportAndReportErrors(executableSchemaId);
              }
            }

            // Calculates signature and referenced fields for the current document.
            // Only call this when the document properly parses and validates and
            // the given operation name (if any) is known!
            function getOperationDerivedData(): OperationDerivedData {
              if (!requestContext.document) {
                // This shouldn't happen: no document means parse failure, which
                // uses its own special statsReportKey.
                throw new Error('No document?');
              }

              const cacheKey = operationDerivedDataCacheKey(
                requestContext.queryHash,
                requestContext.operationName || '',
              );

              // Ensure that the cache we have is for the right schema.
              if (
                !operationDerivedDataCache ||
                operationDerivedDataCache.forSchema !== schema
              ) {
                operationDerivedDataCache = {
                  forSchema: schema,
                  cache: createOperationDerivedDataCache({ logger }),
                };
              }

              // If we didn't have the signature in the cache, we'll resort to
              // calculating it.
              const cachedOperationDerivedData =
                operationDerivedDataCache.cache.get(cacheKey);
              if (cachedOperationDerivedData) {
                return cachedOperationDerivedData;
              }

              const generatedSignature = (
                options.calculateSignature || usageReportingSignature
              )(requestContext.document, requestContext.operationName || '');

              const generatedOperationDerivedData: OperationDerivedData = {
                signature: generatedSignature,
                referencedFieldsByType: calculateReferencedFieldsByType({
                  document: requestContext.document,
                  schema,
                  resolvedOperationName: requestContext.operationName ?? null,
                }),
              };

              // Note that this cache is always an in-memory cache.
              // If we replace it with a more generic async cache, we should
              // not await the write operation.
              operationDerivedDataCache.cache.set(
                cacheKey,
                generatedOperationDerivedData,
              );
              return generatedOperationDerivedData;
            }
          },
        };
      };

      return {
        async serverWillStop() {
          if (reportTimer) {
            clearInterval(reportTimer);
            reportTimer = undefined;
          }

          stopped = true;
          await sendAllReportsAndReportErrors();
        },
      };
    },
  };
}

export function makeHTTPRequestHeaders(
  http: Trace.IHTTP,
  headers: Headers,
  sendHeaders?: SendValuesBaseOptions,
): void {
  if (
    !sendHeaders ||
    ('none' in sendHeaders && sendHeaders.none) ||
    ('all' in sendHeaders && !sendHeaders.all)
  ) {
    return;
  }
  for (const [key, value] of headers) {
    const lowerCaseKey = key.toLowerCase();
    if (
      ('exceptNames' in sendHeaders &&
        // We assume that most users only have a few headers to hide, or will
        // just set {none: true} ; we can change this linear-time
        // operation if it causes real performance issues.
        sendHeaders.exceptNames.some((exceptHeader) => {
          // Headers are case-insensitive, and should be compared as such.
          return exceptHeader.toLowerCase() === lowerCaseKey;
        })) ||
      ('onlyNames' in sendHeaders &&
        !sendHeaders.onlyNames.some((header) => {
          return header.toLowerCase() === lowerCaseKey;
        }))
    ) {
      continue;
    }

    switch (key) {
      case 'authorization':
      case 'cookie':
      case 'set-cookie':
        break;
      default:
        http!.requestHeaders![key] = new Trace.HTTP.Values({
          value: [value],
        });
    }
  }
}

function defaultGenerateClientInfo({ request }: GraphQLRequestContext) {
  const clientNameHeaderKey = 'apollographql-client-name';
  const clientVersionHeaderKey = 'apollographql-client-version';

  // Default to using the `apollo-client-x` header fields if present.
  // If none are present, fallback on the `clientInfo` query extension
  // for backwards compatibility.
  // The default value if neither header values nor query extension is
  // set is the empty String for all fields (as per protobuf defaults)
  if (
    request.http?.headers?.get(clientNameHeaderKey) ||
    request.http?.headers?.get(clientVersionHeaderKey)
  ) {
    return {
      clientName: request.http?.headers?.get(clientNameHeaderKey),
      clientVersion: request.http?.headers?.get(clientVersionHeaderKey),
    };
  } else if (request.extensions?.clientInfo) {
    return request.extensions.clientInfo;
  } else {
    return {};
  }
}

// This plugin does nothing, but it ensures that ApolloServer won't try
// to add a default ApolloServerPluginUsageReporting.
export function ApolloServerPluginUsageReportingDisabled(): InternalApolloServerPlugin {
  return {
    __internal_plugin_id__() {
      return 'UsageReporting';
    },
  };
}
