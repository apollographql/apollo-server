import {
  parse,
  validate,
  DocumentNode,
  GraphQLSchema,
  OperationDefinitionNode,
  Kind,
} from 'graphql';

export class OperationStore {
  private storedOperations: Map<string, DocumentNode>;
  private schema: GraphQLSchema;

  constructor(schema: GraphQLSchema) {
    this.schema = schema;
    this.storedOperations = new Map<string, DocumentNode>();
  }

  public put(operation: string | DocumentNode): void {
    function isOperationDefinition(definition): definition is OperationDefinitionNode {
      return definition.kind === Kind.OPERATION_DEFINITION;
    }

    function isString(definition): definition is string {
      return typeof definition === 'string';
    }

    const ast = isString(operation) ? parse(operation as string) : operation as DocumentNode;

    const definitions = ast.definitions.filter(isOperationDefinition) as OperationDefinitionNode[];
    if (definitions.length === 0) {
      throw new Error('OperationDefinitionNode must contain at least one definition');
    }
    if (definitions.length > 1) {
      throw new Error('OperationDefinitionNode must contain only one definition');
    }

    const validationErrors = validate(this.schema, ast);
    if (validationErrors.length > 0) {
      const messages = validationErrors.map((e) => e.message);
      const err = new Error(`Validation Errors:\n${messages.join('\n')}`);
      err['originalErrors'] = validationErrors;
      throw err;
    }
    this.storedOperations.set(definitions[0].name.value, ast);
  }

  public get(operationName: string): DocumentNode {
    return this.storedOperations.get(operationName);
  }

  public delete(operationName: string): boolean {
    return this.storedOperations.delete(operationName);
  }

  public getMap(): Map<string, DocumentNode> {
    return this.storedOperations;
  }
}
