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

  public put(operationDefinition: string): void {
    const ast = parse(operationDefinition);

    function isOperationDefinition(definition): definition is OperationDefinition {
      return definition.kind === OPERATION_DEFINITION;
    }

    if (ast.definitions.length > 1) {
      throw new Error('operationDefinition must contain only one definition');
    }
    const definition = ast.definitions[0];

    if (isOperationDefinition(definition)) {
      const validationErrors = validate(this.schema, ast);
      if (validationErrors.length > 0) {
        const messages = validationErrors.map((e) => e.message);
        const e = new Error(`Validation Errors:\n${messages.join('\n')}`);
        e['originalErrors'] = validationErrors;
        throw e;
      }
      this.storedOperations.set(definition.name.value, ast);
    } else {
      throw new Error(`operationDefinition must contain an OperationDefinition: ${operationDefinition}`);
    }
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
