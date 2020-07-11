import {
  ApolloServerPlugin,
  GraphQLRequestListener
} from "apollo-server-plugin-base";
import { ForbiddenError } from "apollo-server-errors";
import loglevel from "loglevel";

interface Options {
  debug?: boolean;
  enforceOperationNaming?: boolean;
  enforceClientNaming?: boolean;
  enforceClientVersion?: boolean;
  clientNameHeader?: string;
  clientVersionHeader?: string;
}

export default function ReportForbiddenOperationsPlugin(options: Options = Object.create(null)) {
  const logger = loglevel.getLogger(`apollo-server:report-forbidden-operations-plugin`);
  if (options.debug === true) logger.enableAll();

  Object.freeze(options);

  return (): ApolloServerPlugin => ({
    requestDidStart(): GraphQLRequestListener<any> {
      return {
        didEncounterErrors({ errors, request, operation, operationName, queryHash }) {
          errors.map(error => {
            let clientInfo = {
              name: request.http?.headers.get("apollographql-client-name") || '',
              version: request.http?.headers.get("apollographql-client-version") || ''
            }

            if (error instanceof ForbiddenError) {
              //We now know the operation running will be forbidden
              //There will me a max of 1 ForbiddenError per GraphQL Operation

              //ForbiddenError Data to be reported
              let forbiddenErrorData = {
                clientInfo,
                operation,
                operationName,
                queryHash
              }

              //Depending on client identity information attached, you might want to change how you report ForbiddenErrors
              if (forbiddenErrorData.clientInfo.name && forbiddenErrorData.clientInfo.version) {
                logger.error(`ForbiddenError for ${forbiddenErrorData.clientInfo.name}@${forbiddenErrorData.clientInfo.version}`);
                //Send error to external observability
              } else if (forbiddenErrorData.clientInfo.name) {
                logger.error(`ForbiddenError for ${forbiddenErrorData.clientInfo.name} with no version attached`);
                //Send error to external observability
              } else {
                logger.error(`ForbiddenError from unidentified client`);
                //Send error to external observability
              }
            }
          })
        }
      };
    }
  });
}
