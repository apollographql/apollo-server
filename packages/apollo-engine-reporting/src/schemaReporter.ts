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
          inSeconds
          withExecutableSchema
        }
      }
    }
  }
`;

export function reportingLoop(
  schemaReporter: SchemaReporter,
  logger: Logger,
  sendNextWithExecutableSchema: boolean,
  fallbackReportingDelayInMs: number,
) {
  function inner() {
    // Bail out permanently
    if (schemaReporter.stopped()) return;

    // Not awaiting this. The callback is handled in the `then` and it calls inner()
    // to report the server info in however many seconds we were told to wait from
    // Apollo Graph Manager
    schemaReporter
      .reportServerInfo(sendNextWithExecutableSchema)
      .then(({ inSeconds, withExecutableSchema }) => {
        sendNextWithExecutableSchema = withExecutableSchema;
        setTimeout(inner, inSeconds * 1000);
      })
      .catch((error: any) => {
        // In the case of an error we want to continue looping
        // We can add hardcoded backoff in the future,
        // or on repeated failures stop responding reporting.
        logger.error(
          `Error reporting server info to Apollo Graph Manager during schema reporting: ${error}`,
        );
        sendNextWithExecutableSchema = false;
        setTimeout(inner, fallbackReportingDelayInMs);
      });
  }

  inner();
}

interface ReportServerInfoReturnVal {
  inSeconds: number;
  withExecutableSchema: boolean;
}

// This class is meant to be a thin shim around the gql mutations.
export class SchemaReporter {
  // These mirror the gql variables
  private readonly serverInfo: EdgeServerInfo;
  private readonly executableSchemaDocument: any;
  private readonly url: string;

  private isStopped: boolean;
  private readonly headers: Headers;

  constructor(
    serverInfo: EdgeServerInfo,
    schemaSdl: string,
    apiKey: string,
    schemaReportingEndpoint: string | undefined,
  ) {
    this.headers = new Headers();
    this.headers.set('Content-Type', 'application/json');
    this.headers.set('x-api-key', apiKey);
    this.headers.set('apollographql-client-name', 'apollo-engine-reporting');
    this.headers.set(
      'apollographql-client-version',
      require('../package.json').version,
    );

    this.url =
      schemaReportingEndpoint ||
      'https://edge-server-reporting.api.apollographql.com/api/graphql';

    this.serverInfo = serverInfo;
    this.executableSchemaDocument = schemaSdl;
    this.isStopped = false;
  }

  public stopped(): Boolean {
    return this.isStopped;
  }

  public stop() {
    this.isStopped = true;
  }

  public async reportServerInfo(
    withExecutableSchema: boolean,
  ): Promise<ReportServerInfoReturnVal> {
    const { data, errors } = await this.graphManagerQuery({
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
        'Unexpected response shape from Apollo Graph Manager when',
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
          'https://engine.apollographql.com/ to obtain an API key for a service.',
        ].join(' '),
      );
    } else if (data.me.__typename === 'ServiceMutation') {
      if (!data.me.reportServerInfo) {
        throw new Error(msgForUnexpectedResponse(data));
      }
      return data.me.reportServerInfo;
    } else {
      throw new Error(msgForUnexpectedResponse(data));
    }
  }

  private async graphManagerQuery(
    variables: ReportServerInfoVariables,
  ): Promise<SchemaReportingServerInfoResult> {
    const request: GraphQLRequest = {
      query: reportServerInfoGql,
      operationName: 'ReportServerInfo',
      variables: variables,
    };
    const httpRequest = new Request(this.url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(request),
    });

    const httpResponse = await fetch(httpRequest);

    if (!httpResponse.ok) {
      throw new Error([
        `An unexpected HTTP status code (${httpResponse.status}) was`,
        'encountered during schema reporting.'
      ].join(' '));
    }

    try {
      // JSON parsing failure due to malformed data is the likely failure case
      // here.  Any non-JSON response (e.g. HTML) is usually the suspect.
      return await httpResponse.json();
    } catch (error) {
      throw new Error(
        [
          "Couldn't report server info to Apollo Graph Manager.",
          'Parsing response as JSON failed.',
          'If this continues please reach out to support@apollographql.com',
          error
        ].join(' '),
      );
    }
  }
}
