import {
    GraphQLSchema,
    ExecutionResult,
    DocumentNode,
    parse,
    print,
    validate,
    execute,
    formatError,
    specifiedRules,
    ValidationContext,
} from 'graphql';
import { LogAction, LogFunction, LogMessage, LogStep, QueryOptions} from './runQuery';
import { Observable, IObservable } from './Observable';

export type ReactiveExecuteFunction = (
  schema: GraphQLSchema,
  document: DocumentNode,
  rootValue?: any,
  contextValue?: any,
  variableValues?: {[key: string]: any},
  operationName?: string
) => IObservable<ExecutionResult>;

export interface ReactiveQueryOptions extends QueryOptions {
  executeReactive: ReactiveExecuteFunction;
}

const resolvedPromise = Promise.resolve();

export function runQueryReactive(options: ReactiveQueryOptions): IObservable<ExecutionResult> {
    let documentAST: DocumentNode;

    const logFunction = options.logFunction || function(){ return null; };
    const debugDefault = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';
    const debug = typeof options.debug !== 'undefined' ? options.debug : debugDefault;

    logFunction({action: LogAction.request, step: LogStep.start});

    function format(errors: Array<Error>): Array<Error> {
        return errors.map((error) => {
          if (options.formatError) {
            try {
              return options.formatError(error);
            } catch (err) {
              console.error('Error in formatError function:', err);
              const newError = new Error('Internal server error');
              return formatError(newError);
            }
          } else {
            return formatError(error);
          }
        }) as Array<Error>;
    }

    function printStackTrace(error: Error) {
      console.error(error.stack);
    }

    const qry = typeof options.query === 'string' ? options.query : print(options.query);
    logFunction({action: LogAction.request, step: LogStep.status, key: 'query', data: qry});
    logFunction({action: LogAction.request, step: LogStep.status, key: 'variables', data: options.variables});
    logFunction({action: LogAction.request, step: LogStep.status, key: 'operationName', data: options.operationName});

    // if query is already an AST, don't parse or validate
    if (typeof options.query === 'string') {
        try {
            // TODO: time this with log function
            logFunction({action: LogAction.parse, step: LogStep.start});
            documentAST = parse(options.query as string);
            logFunction({action: LogAction.parse, step: LogStep.end});
        } catch (syntaxError) {
            logFunction({action: LogAction.parse, step: LogStep.end});
            return Observable.of({ errors: format([syntaxError]) });
        }

        let rules = specifiedRules;
        if (options.validationRules) {
          rules = rules.concat(options.validationRules);
        }
        logFunction({action: LogAction.validation, step: LogStep.start});
        const validationErrors = validate(options.schema, documentAST, rules);
        logFunction({action: LogAction.validation, step: LogStep.end});
        if (validationErrors.length) {
            return Observable.of({ errors: format(validationErrors) });
        }
    } else {
        documentAST = options.query as DocumentNode;
    }

    logFunction({action: LogAction.execute, step: LogStep.start});
    return new Observable((observer) => {
      try {
        return options.executeReactive(
          options.schema,
          documentAST,
          options.rootValue,
          options.context,
          options.variables,
          options.operationName
        ).subscribe({
          next: (gqlResponse) => {
            logFunction({action: LogAction.execute, step: LogStep.end});
            let response = {
              data: gqlResponse.data,
            };
            if (gqlResponse.errors) {
              response['errors'] = format(gqlResponse.errors);
              if (debug) {
                gqlResponse.errors.forEach(printStackTrace);
              }
            }
            if (options.formatResponse) {
              response = options.formatResponse(response, options);
            }
            observer.next(response);
          },
          error: (executionError) => {
            logFunction({action: LogAction.execute, step: LogStep.end});
            logFunction({action: LogAction.request, step: LogStep.end});
            observer.next({ errors: format([executionError]) });
          },
          complete: () => {
            logFunction({action: LogAction.request, step: LogStep.end});
            observer.complete();
          },
        });
      } catch (executionError) {
        logFunction({action: LogAction.execute, step: LogStep.end});
        logFunction({action: LogAction.request, step: LogStep.end});
        observer.next({ errors: format([executionError]) });
        observer.complete();
        return () => {};
      }
    });
}
