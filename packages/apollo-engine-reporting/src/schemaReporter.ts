// Fields required for the trial related emails
import gql from 'graphql-tag';
import {
  AutoregReportServerInfo,
  ReportServerInfoVariables,
  EdgeServerInfo,
} from './reportingOperationTypes';
import { DocumentNode, execute, makePromise, Observable } from 'apollo-link';
import { FetchResult } from 'apollo-link/lib/types';
import { HttpLink } from 'apollo-link-http';
import { fetch } from 'apollo-server-env';
import { Logger } from 'apollo-server-types';

const reportServerInfoGql = gql`
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

class ReportingError extends Error {}

export function reportingLoop(
  schemaReporter: SchemaReporter,
  logger: Logger,
  sendNextWithExecutableSchema: boolean,
  fallbackReportingDelayInMs: number,
) {
  function inner() {
    // Bail out permanently
    if (schemaReporter.stopped()) return;

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
        logger.warn(`Error in reportingServerInfo: ${error}`);
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
  private readonly apiKey: string;
  private readonly graphManagerHttpLink: HttpLink;

  // These mirror the gql variables
  private readonly serverInfo: EdgeServerInfo;
  private readonly executableSchemaDocument: any;
  private isStopped: boolean;

  constructor(
    serverInfo: EdgeServerInfo,
    schemaSdl: string,
    apiKey: string,
    reportingEndpoint: string | undefined,
  ) {
    if (apiKey === '') {
      throw new Error('No api key defined');
    }

    this.apiKey = apiKey;

    this.graphManagerHttpLink = new HttpLink({
      uri:
        reportingEndpoint ||
        'https://engine-graphql.apollographql.com/api/graphql',
      fetch,
      headers: { 'x-api-key': this.apiKey },
    });

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
    const { data, errors } = await this.graphManagerQuery<
      AutoregReportServerInfo
    >(reportServerInfoGql, {
      info: this.serverInfo,
      executableSchema: withExecutableSchema
        ? this.executableSchemaDocument
        : null,
    } as ReportServerInfoVariables);

    if (errors) {
      throw new ReportingError((errors || []).map(x => x.message).join('\n'));
    }

    if (!data || !data.me || !data.me.__typename) {
      throw new ReportingError(`
Heartbeat response error. Received incomplete data from Apollo graph manager.
If this continues please reach out at support@apollographql.com.
Got response: "${JSON.stringify(data)}"
      `);
    }

    if (data.me.__typename == 'UserMutation') {
      this.isStopped = true;
      throw new ReportingError(`
      User tokens cannot be used for schema reporting. Only service tokens.
      `);
    } else if (data.me.__typename == 'ServiceMutation') {
      if (!data.me.reportServerInfo) {
        throw new ReportingError(`
Heartbeat response error. Received incomplete data from Apollo graph manager.
If this continues please reach out at support@apollographql.com.
Got response: "${JSON.stringify(data)}"
      `);
      }
      return data.me.reportServerInfo;
    } else {
      throw new ReportingError(`
Unexpected response. Received unexpected data from Apollo Graph Manager
If this continues please reach out at support@apollographql.com.
Got response: "${JSON.stringify(data)}"
      `);
    }
  }

  private async graphManagerQuery<
    Result = Record<string, any>,
    Variables = Record<string, any>
  >(query: DocumentNode, variables: Variables): Promise<FetchResult<Result>> {
    return makePromise<FetchResult<Result>>(
      execute(this.graphManagerHttpLink, {
        query,
        variables,
      }) as Observable<FetchResult<Result>>,
    );
  }
}
