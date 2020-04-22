import {
  SelectionNode,
  DocumentNode,
  FieldDefinitionNode,
  DirectiveDefinitionNode,
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
  isValueType?: boolean;
}

export interface FederationField {
  serviceName?: ServiceName;
  requires?: ReadonlyArray<SelectionNode>;
  provides?: ReadonlyArray<SelectionNode>;
  belongsToValueType?: boolean;
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

declare module 'graphql/type/directives' {
  interface GraphQLDirective {
    federation?: {
      directiveDefinitions: {
        [serviceName: string]: DirectiveDefinitionNode;
      };
    };
  }
}

declare module 'graphql/language/ast' {
  interface UnionTypeDefinitionNode {
    serviceName?: string | null;
  }
  interface UnionTypeExtensionNode {
    serviceName?: string | null;
  }

  interface EnumTypeDefinitionNode {
    serviceName?: string | null;
  }

  interface EnumTypeExtensionNode {
    serviceName?: string | null;
  }

  interface ScalarTypeDefinitionNode {
    serviceName?: string | null;
  }

  interface ScalarTypeExtensionNode {
    serviceName?: string | null;
  }

  interface ObjectTypeDefinitionNode {
    serviceName?: string | null;
  }

  interface ObjectTypeExtensionNode {
    serviceName?: string | null;
  }

  interface InterfaceTypeDefinitionNode {
    serviceName?: string | null;
  }

  interface InterfaceTypeExtensionNode {
    serviceName?: string | null;
  }

  interface InputObjectTypeDefinitionNode {
    serviceName?: string | null;
  }

  interface InputObjectTypeExtensionNode {
    serviceName?: string | null;
  }
}
