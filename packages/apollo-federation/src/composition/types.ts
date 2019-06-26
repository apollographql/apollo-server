import {
  SelectionNode,
  DocumentNode,
  FieldDefinitionNode,
  TypeDefinitionNode,
  TypeExtensionNode,
} from 'graphql';

export type ServiceName = string | null;

export type DefaultRootOperationTypeName =
  | 'Query'
  | 'Mutation'
  | 'Subscription';

export interface ExternalFieldDefinition {
  field: FieldDefinitionNode;
  parentTypeName: string;
  serviceName: string;
}

export interface ServiceNameToKeyDirectivesMap {
  [serviceName: string]: ReadonlyArray<SelectionNode>[];
}

export interface FederationType {
  serviceName?: ServiceName;
  keys?: ServiceNameToKeyDirectivesMap;
  externals?: {
    [serviceName: string]: ExternalFieldDefinition[];
  };
}

export interface FederationField {
  serviceName?: ServiceName;
  requires?: ReadonlyArray<SelectionNode>;
  provides?: ReadonlyArray<SelectionNode>;
}

export interface ServiceDefinition {
  typeDefs: DocumentNode;
  name: string;
  url?: string;
}

declare module 'graphql/type/definition' {
  interface GraphQLObjectType {
    federation?: FederationType;
  }

  interface GraphQLEnumType {
    federation?: FederationType;
  }

  interface GraphQLScalarType {
    federation?: FederationType;
  }

  interface GraphQLInterfaceType {
    federation?: FederationType;
  }

  interface GraphQLUnionType {
    federation?: FederationType;
  }

  interface GraphQLInputObjectType {
    federation?: FederationType;
  }

  interface GraphQLEnumValue {
    federation?: FederationType;
  }

  interface GraphQLInputField {
    federation?: FederationField;
  }

  interface GraphQLField<TSource, TContext> {
    federation?: FederationField;
  }
}

export type FederatedTypeDefinitionNode = TypeDefinitionNode & {
  serviceName: string | null;
};

export type FederatedTypeExtensionNode = TypeExtensionNode & {
  serviceName: string | null;
};
