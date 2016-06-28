import {
  parse,
  validate,
  Document,
  GraphQLSchema,
} from 'graphql';

export class OperationStore {
  private storedOperations: Map<string, Document>;
  private schema: GraphQLSchema;

  constructor(schema: GraphQLSchema) {
    this.schema = schema;
    this.storedOperations = new Map();
  }

  // TODO: maybe we should extract the operationName from the operationDefinition?
  public put(operationName: string, operationDefinition: string) {
    const ast = parse(operationDefinition);
    const kind = ast.definitions[0].kind;
    if (kind !== 'OperationDefinition') {
      throw new Error(`operationDefinition must contain an OperationDefintion, got ${kind}: ${operationDefinition}`);
    }
    if (ast.definitions.length > 1) {
      throw new Error('operationDefinition must contain only one definition');
    }
    const validationErrors = validate(this.schema, ast);
    if (validationErrors.length > 0) {
      const messages = validationErrors.map((e) => e.message);
      const e = new Error(`Validation Errors:\n${messages.join('\n')}`);
      e['originalErrors'] = validationErrors;
      throw e;
    }
    this.storedOperations.set(operationName, ast);
  }

  public get(operationName: string) {
    return this.storedOperations.get(operationName);
  }

  public delete(operationName: string) {
    return this.storedOperations.delete(operationName);
  }

  public getMap() {
    return this.storedOperations;
  }
}
