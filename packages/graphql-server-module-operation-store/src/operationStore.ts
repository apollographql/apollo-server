import {
  parse,
  validate,
  Document,
  GraphQLSchema,
  OperationDefinition,
} from 'graphql';

const OPERATION_DEFINITION: string = 'OperationDefinition';

export class OperationStore {
  private storedOperations: Map<string, Document>;
  private schema: GraphQLSchema;

  constructor(schema: GraphQLSchema) {
    this.schema = schema;
    this.storedOperations = new Map<string, Document>();
  }

  public put(operation: string | Document): void {
    function isOperationDefinition(definition): definition is OperationDefinition {
      return definition.kind === OPERATION_DEFINITION;
    }

    function isString(definition): definition is string {
      return typeof definition === 'string';
    }

    const ast = isString(operation) ? parse(operation as string) : operation as Document;

    const definitions = ast.definitions.filter(isOperationDefinition) as OperationDefinition[];
    if (definitions.length === 0) {
      throw new Error('operationDefinition must contain at least one definition');
    }
    if (definitions.length > 1) {
      throw new Error('operationDefinition must contain only one definition');
    }

    const validationErrors = validate(this.schema, ast);
    if (validationErrors.length > 0) {
      const messages = validationErrors.map((e) => e.message);
      const e = new Error(`Validation Errors:\n${messages.join('\n')}`);
      e['originalErrors'] = validationErrors;
      throw e;
    }
    this.storedOperations.set(definitions[0].name.value, ast);
  }

  public get(operationName: string): Document {
    return this.storedOperations.get(operationName);
  }

  public delete(operationName: string): boolean {
    return this.storedOperations.delete(operationName);
  }

  public getMap(): Map<string, Document> {
    return this.storedOperations;
  }
}
