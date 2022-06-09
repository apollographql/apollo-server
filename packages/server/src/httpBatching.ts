import type {
  BaseContext,
  HTTPGraphQLRequest,
  HTTPGraphQLResponse,
} from './externalTypes';
import type { ApolloServerInternals, SchemaDerivedData } from './ApolloServer';
import { runHttpQuery } from './runHttpQuery';
import { BadRequestError } from './errors';
import { HeaderMap } from './internal';

export async function runBatchHttpQuery<TContext extends BaseContext>(
  batchRequest: Omit<HTTPGraphQLRequest, 'body'> & { body: any[] },
  contextValue: TContext,
  schemaDerivedData: SchemaDerivedData,
  internals: ApolloServerInternals<TContext>,
): Promise<HTTPGraphQLResponse> {
  // TODO(AS4): Handle empty list as an error

  const combinedResponse: HTTPGraphQLResponse = {
    headers: new HeaderMap(),
    bodyChunks: null,
    completeBody: '',
  };
  const responseBodies = await Promise.all(
    batchRequest.body.map(async (body: any) => {
      const singleRequest: HTTPGraphQLRequest = {
        ...batchRequest,
        body,
      };

      const response = await runHttpQuery(
        singleRequest,
        contextValue,
        schemaDerivedData,
        internals,
      );

      if (response.completeBody === null) {
        // TODO(AS4): Implement incremental delivery or improve error handling.
        throw Error('Incremental delivery not implemented');
      }
      for (const [key, value] of response.headers) {
        // Override any similar header set in other responses.
        // TODO(AS4): this is what AS3 did but maybe this is silly
        combinedResponse.headers.set(key, value);
      }
      // If two responses both want to set the status code, one of them will win.
      // Note that the normal success case leaves statusCode empty.
      if (response.statusCode) {
        combinedResponse.statusCode = response.statusCode;
      }
      return response.completeBody;
    }),
  );
  combinedResponse.completeBody = `[${responseBodies.join(',')}]`;
  return combinedResponse;
}

export async function runPotentiallyBatchedHttpQuery<
  TContext extends BaseContext,
>(
  httpGraphQLRequest: HTTPGraphQLRequest,
  contextValue: TContext,
  schemaDerivedData: SchemaDerivedData,
  internals: ApolloServerInternals<TContext>,
): Promise<HTTPGraphQLResponse> {
  if (!Array.isArray(httpGraphQLRequest.body)) {
    return await runHttpQuery(
      httpGraphQLRequest,
      contextValue,
      schemaDerivedData,
      internals,
    );
  }
  if (internals.allowBatchedHttpRequests) {
    return await runBatchHttpQuery(
      httpGraphQLRequest,
      contextValue,
      schemaDerivedData,
      internals,
    );
  }
  throw new BadRequestError('Operation batching disabled.');
}
