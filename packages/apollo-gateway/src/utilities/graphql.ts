import {
  ASTNode,
  FieldNode,
  GraphQLCompositeType,
  GraphQLField,
  GraphQLInterfaceType,
  GraphQLNullableType,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLType,
  GraphQLUnionType,
  isListType,
  isNonNullType,
  Kind,
  ListTypeNode,
  NamedTypeNode,
  OperationDefinitionNode,
  parse,
  print,
  SchemaMetaFieldDef,
  SelectionNode,
  TypeMetaFieldDef,
  TypeNameMetaFieldDef,
  TypeNode,
} from 'graphql';

/**
 * Not exactly the same as the executor's definition of getFieldDef, in this
 * statically evaluated environment we do not always have an Object type,
 * and need to handle Interface and Union types.
 */
export function getFieldDef(
  schema: GraphQLSchema,
  parentType: GraphQLCompositeType,
  fieldName: string,
): GraphQLField<any, any> | undefined {
  if (
    fieldName === SchemaMetaFieldDef.name &&
    schema.getQueryType() === parentType
  ) {
    return SchemaMetaFieldDef;
  }
  if (
    fieldName === TypeMetaFieldDef.name &&
    schema.getQueryType() === parentType
  ) {
    return TypeMetaFieldDef;
  }
  if (
    fieldName === TypeNameMetaFieldDef.name &&
    (parentType instanceof GraphQLObjectType ||
      parentType instanceof GraphQLInterfaceType ||
      parentType instanceof GraphQLUnionType)
  ) {
    return TypeNameMetaFieldDef;
  }
  if (
    parentType instanceof GraphQLObjectType ||
    parentType instanceof GraphQLInterfaceType
  ) {
    return parentType.getFields()[fieldName];
  }

  return undefined;
}

export function getResponseName(node: FieldNode): string {
  return node.alias ? node.alias.value : node.name.value;
}

export function allNodesAreOfSameKind<T extends ASTNode>(
  firstNode: T,
  remainingNodes: ASTNode[],
): remainingNodes is T[] {
  return !remainingNodes.some(node => node.kind !== firstNode.kind);
}

export function astFromType(
  type: GraphQLNullableType,
): NamedTypeNode | ListTypeNode;
export function astFromType(type: GraphQLType): TypeNode {
  if (isListType(type)) {
    return { kind: Kind.LIST_TYPE, type: astFromType(type.ofType) };
  } else if (isNonNullType(type)) {
    return { kind: Kind.NON_NULL_TYPE, type: astFromType(type.ofType) };
  } else {
    return {
      kind: Kind.NAMED_TYPE,
      name: { kind: Kind.NAME, value: type.name },
    };
  }
}

export function printWithReducedWhitespace(ast: ASTNode): string {
  return print(ast)
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseSelections(source: string): ReadonlyArray<SelectionNode> {
  return (parse(`query { ${source} }`)
    .definitions[0] as OperationDefinitionNode).selectionSet.selections;
}
