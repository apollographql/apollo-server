import {
  ReportServerInfoVariables,
  EdgeServerInfo,
  SchemaReportingServerInfoResult,
} from './reportingOperationTypes';
import { fetch, Headers, Request } from 'apollo-server-env';
import { GraphQLRequest, Logger } from 'apollo-server-types';

export const reportServerInfoGql = `
  mutation ReportServerInfo($info: EdgeServerInfo!, $executableSchema: String) {
    me {
      __typename
      ... on ServiceMutation {
        reportServerInfo(info: $info, executableSchema: $executableSchema) {
          __typename
          ... on ReportServerInfoError {
            message
            code
          }
          ... on ReportServerInfoResponse {
            inSeconds
            withExecutableSchema
          }
        }
      }
    }
  }
`;

export type ReportInfoResult = ReportInfoStop | ReportInfoNext;

export interface ReportInfoNext {
  kind: 'next';
  inSeconds: number;
  withExecutableSchema: boolean;
}

export interface ReportInfoStop {
  kind: 'stop';
  stopReporting: true;
}

// This class is meant to be a thin shim around the gql mutations.
export class SchemaReporter {
  // These mirror the gql variables
  private readonly serverInfo: EdgeServerInfo;
  private readonly executableSchemaDocument: any;
  private readonly endpointUrl: string;
  private readonly logger: Logger;
  private readonly initialReportingDelayInMs: number;
  private readonly fallbackReportingDelayInMs: number;

  private isStopped: boolean;
  private pollTimer?: NodeJS.Timer;
  private readonly headers: Headers;

  constructor(options: {
    serverInfo: EdgeServerInfo;
    schemaSdl: string;
    apiKey: string;
    endpointUrl: string | undefined;
    logger: Logger;
    initialReportingDelayInMs: number;
    fallbackReportingDelayInMs: number;
  }) {
    this.headers = new Headers();
    this.headers.set('Content-Type', 'application/json');
    this.headers.set('x-api-key', options.apiKey);
    this.headers.set(
      'apollographql-client-name',
      'ApolloServerPluginSchemaReporting',
    );
    this.headers.set(
      'apollographql-client-version',
      require('../../../package.json').version,
    );

    this.endpointUrl =
      options.endpointUrl ||
      'https://schema-reporting.api.apollographql.com/api/graphql';

    this.serverInfo = options.serverInfo;
    this.executableSchemaDocument = options.schemaSdl;
    this.isStopped = false;
    this.logger = options.logger;
    this.initialReportingDelayInMs = options.initialReportingDelayInMs;
    this.fallbackReportingDelayInMs = options.fallbackReportingDelayInMs;
  }

  public stopped(): Boolean {
    return this.isStopped;
  }

  public start() {
    this.pollTimer = setTimeout(
      () => this.sendOneReportAndScheduleNext(false),
      this.initialReportingDelayInMs,
    );
  }

  public stop() {
    this.isStopped = true;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = undefined;
    }
  }

  private async sendOneReportAndScheduleNext(
    sendNextWithExecutableSchema: boolean,
  ) {
    this.pollTimer = undefined;

    // Bail out permanently
    if (this.stopped()) return;
    try {
      const result = await this.reportServerInfo(sendNextWithExecutableSchema);
      switch (result.kind) {
        case 'next':
          this.pollTimer = setTimeout(
            () =>
              this.sendOneReportAndScheduleNext(result.withExecutableSchema),
            result.inSeconds * 1000,
          );
          return;
        case 'stop':
          return;
      }
    } catch (error) {
      // In the case of an error we want to continue looping
      // We can add hardcoded backoff in the future,
      // or on repeated failures stop responding reporting.
      this.logger.error(
        `Error reporting server info to Apollo during schema reporting: ${error}`,
      );
      this.pollTimer = setTimeout(
        () => this.sendOneReportAndScheduleNext(false),
        this.fallbackReportingDelayInMs,
      );
    }
  }

  public async reportServerInfo(
    withExecutableSchema: boolean,
  ): Promise<ReportInfoResult> {
    const { data, errors } = await this.apolloQuery({
      info: this.serverInfo,
      executableSchema: withExecutableSchema
        ? this.executableSchemaDocument
        : null,
    });

    if (errors) {
      throw new Error((errors || []).map((x: any) => x.message).join('\n'));
    }

    function msgForUnexpectedResponse(data: any): string {
      return [
        'Unexpected response shape from Apollo when',
        'reporting server information for schema reporting. If',
        'this continues, please reach out to support@apollographql.com.',
        'Received response:',
        JSON.stringify(data),
      ].join(' ');
    }

    if (!data || !data.me || !data.me.__typename) {
      throw new Error(msgForUnexpectedResponse(data));
    }

    if (data.me.__typename === 'UserMutation') {
      this.isStopped = true;
      throw new Error(
        [
          'This server was configured with an API key for a user.',
          "Only a service's API key may be used for schema reporting.",
          'Please visit the settings for this graph at',
          'https://studio.apollographql.com/ to obtain an API key for a service.',
        ].join(' '),
      );
    } else if (
      data.me.__typename === 'ServiceMutation' &&
      data.me.reportServerInfo
    ) {
      if (data.me.reportServerInfo.__typename == 'ReportServerInfoResponse') {
        return {
          kind: 'next',
          inSeconds: data.me.reportServerInfo.inSeconds,
          withExecutableSchema: data.me.reportServerInfo.withExecutableSchema,
        };
      } else {
        this.logger.error(
          [
            'Received input validation error from Apollo:',
            data.me.reportServerInfo.message,
            'Stopping reporting. Please fix the input errors.',
          ].join(' '),
        );
        this.stop();
        return {
          stopReporting: true,
          kind: 'stop',
        };
      }
    }
    throw new Error(msgForUnexpectedResponse(data));
  }

  private async apolloQuery(
    variables: ReportServerInfoVariables,
  ): Promise<SchemaReportingServerInfoResult> {
    const request: GraphQLRequest = {
      query: reportServerInfoGql,
      operationName: 'ReportServerInfo',
      variables: variables,
    };
    const httpRequest = new Request(this.endpointUrl, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(request),
    });

    const httpResponse = await fetch(httpRequest);

    if (!httpResponse.ok) {
      throw new Error(
        [
          `An unexpected HTTP status code (${httpResponse.status}) was`,
          'encountered during schema reporting.',
        ].join(' '),
      );
    }

    try {
      // JSON parsing failure due to malformed data is the likely failure case
      // here.  Any non-JSON response (e.g. HTML) is usually the suspect.
      return await httpResponse.json();
    } catch (error) {
      throw new Error(
        [
          "Couldn't report server info to Apollo.",
          'Parsing response as JSON failed.',
          'If this continues please reach out to support@apollographql.com',
          error,
        ].join(' '),
      );
    }
  }
}
