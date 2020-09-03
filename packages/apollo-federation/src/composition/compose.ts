import 'apollo-server-env';
import {
  GraphQLSchema,
  extendSchema,
  Kind,
  isTypeDefinitionNode,
  isTypeExtensionNode,
  GraphQLError,
  GraphQLNamedType,
  isObjectType,
  FieldDefinitionNode,
  InputValueDefinitionNode,
  DocumentNode,
  GraphQLObjectType,
  specifiedDirectives,
  TypeDefinitionNode,
  DirectiveDefinitionNode,
  TypeExtensionNode,
  ObjectTypeDefinitionNode,
  NamedTypeNode,
} from 'graphql';
import { transformSchema } from 'apollo-graphql';
import federationDirectives from '../directives';
import {
  findDirectivesOnTypeOrField,
  isStringValueNode,
  parseSelections,
  mapFieldNamesToServiceName,
  stripExternalFieldsFromTypeDefs,
  typeNodesAreEquivalent,
  mapValues,
  isFederationDirective,
  executableDirectiveLocations,
  stripTypeSystemDirectivesFromTypeDefs,
  defaultRootOperationNameLookup,
  getFederationMetadata,
} from './utils';
import {
  ServiceDefinition,
  ExternalFieldDefinition,
  ServiceNameToKeyDirectivesMap,
  FederationType,
  FederationField,
  FederationDirective,
} from './types';
import { validateSDL } from 'graphql/validation/validate';
import { compositionRules } from './rules';

const EmptyQueryDefinition = {
  kind: Kind.OBJECT_TYPE_DEFINITION,
  name: { kind: Kind.NAME, value: defaultRootOperationNameLookup.query },
  fields: [],
  serviceName: null,
};
const EmptyMutationDefinition = {
  kind: Kind.OBJECT_TYPE_DEFINITION,
  name: { kind: Kind.NAME, value: defaultRootOperationNameLookup.mutation },
  fields: [],
  serviceName: null,
};

// Map of all type definitions to eventually be passed to extendSchema
interface TypeDefinitionsMap {
  [name: string]: TypeDefinitionNode[];
}
// Map of all type extensions to eventually be passed to extendSchema
interface TypeExtensionsMap {
  [name: string]: TypeExtensionNode[];
}

// Map of all directive definitions to eventually be passed to extendSchema
interface DirectiveDefinitionsMap {
  [name: string]: { [serviceName: string]: DirectiveDefinitionNode };
}

/**
 * A map of base types to their owning service. Used by query planner to direct traffic.
 * This contains the base type's "owner". Any fields that extend this type in another service
 * are listed under "extensionFieldsToOwningServiceMap". extensionFieldsToOwningServiceMap are in the format { myField: my-service-name }
 *
 * Example resulting typeToServiceMap shape:
 *
 * const typeToServiceMap = {
 *   Product: {
 *     serviceName: "ProductService",
 *     extensionFieldsToOwningServiceMap: {
 *       reviews: "ReviewService", // Product.reviews comes from the ReviewService
 *       dimensions: "ShippingService",
 *       weight: "ShippingService"
 *     }
 *   }
 * }
 */
interface TypeToServiceMap {
  [typeName: string]: {
    owningService?: string;
    extensionFieldsToOwningServiceMap: { [fieldName: string]: string };
  };
}

/*
 * Map of types to their key directives (maintains association to their services)
 *
 * Example resulting KeyDirectivesMap shape:
 *
 * const keyDirectives = {
 *   Product: {
 *     serviceA: ["sku", "upc"]
 *     serviceB: ["color {id value}"] // Selection node simplified for readability
 *   }
 * }
 */
export interface KeyDirectivesMap {
  [typeName: string]: ServiceNameToKeyDirectivesMap;
}

/**
 * A set of type names that have been determined to be a value type, a type
 * shared across at least 2 services.
 */
type ValueTypes = Set<string>;

export type ComposedGraphQLSchema = GraphQLSchema & {
  extensions: { serviceList: ServiceDefinition[] }
};
/**
 * Loop over each service and process its typeDefs (`definitions`)
 * - build up typeToServiceMap
 * - push individual definitions onto either typeDefinitionsMap or typeExtensionsMap
 */
export function buildMapsFromServiceList(serviceList: ServiceDefinition[]) {
  const typeDefinitionsMap: TypeDefinitionsMap = Object.create(null);
  const typeExtensionsMap: TypeExtensionsMap = Object.create(null);
  const directiveDefinitionsMap: DirectiveDefinitionsMap = Object.create(null);
  const typeToServiceMap: TypeToServiceMap = Object.create(null);
  const externalFields: ExternalFieldDefinition[] = [];
  const keyDirectivesMap: KeyDirectivesMap = Object.create(null);
  const valueTypes: ValueTypes = new Set();

  for (const { typeDefs, name: serviceName } of serviceList) {
    // Build a new SDL with @external fields removed, as well as information about
    // the fields that were removed.
    const {
      typeDefsWithoutExternalFields,
      strippedFields,
    } = stripExternalFieldsFromTypeDefs(typeDefs, serviceName);

    externalFields.push(...strippedFields);

    // Type system directives from downstream services are not a concern of the
    // gateway, but rather the services on which the fields live which serve
    // those types.  In other words, its up to an implementing service to
    // act on such directives, not the gateway.
    const typeDefsWithoutTypeSystemDirectives =
      stripTypeSystemDirectivesFromTypeDefs(typeDefsWithoutExternalFields);

    for (const definition of typeDefsWithoutTypeSystemDirectives.definitions) {
      if (
        definition.kind === Kind.OBJECT_TYPE_DEFINITION ||
        definition.kind === Kind.OBJECT_TYPE_EXTENSION
      ) {
        const typeName = definition.name.value;

        for (const keyDirective of findDirectivesOnTypeOrField(
          definition,
          'key',
        )) {
          if (
            keyDirective.arguments &&
            isStringValueNode(keyDirective.arguments[0].value)
          ) {
            // Initialize the entry for this type if necessary
            keyDirectivesMap[typeName] = keyDirectivesMap[typeName] || {};
            // Initialize the entry for this service if necessary
            keyDirectivesMap[typeName][serviceName] =
              keyDirectivesMap[typeName][serviceName] || [];
            // Add @key metadata to the array
            keyDirectivesMap[typeName][serviceName].push(
              parseSelections(keyDirective.arguments[0].value.value),
            );
          }
        }
      }

      if (isTypeDefinitionNode(definition)) {
        const typeName = definition.name.value;
        /**
         * This type is a base definition (not an extension). If this type is already in the typeToServiceMap, then
         * 1. It was declared by a previous service, but this newer one takes precedence, or...
         * 2. It was extended by a service before declared
         */
        if (!typeToServiceMap[typeName]) {
          typeToServiceMap[typeName] = {
            extensionFieldsToOwningServiceMap: Object.create(null),
          };
        }

        typeToServiceMap[typeName].owningService = serviceName;

        /**
         * If this type already exists in the definitions map, push this definition to the array (newer defs
         * take precedence). If the types are determined to be identical, add the type name
         * to the valueTypes Set.
         *
         * If not, create the definitions array and add it to the typeDefinitionsMap.
         */
        if (typeDefinitionsMap[typeName]) {
          const isValueType = typeNodesAreEquivalent(
            typeDefinitionsMap[typeName][
              typeDefinitionsMap[typeName].length - 1
            ],
            definition,
          );

          if (isValueType) {
            valueTypes.add(typeName);
          }

          typeDefinitionsMap[typeName].push({ ...definition, serviceName });
        } else {
          typeDefinitionsMap[typeName] = [{ ...definition, serviceName }];
        }
      } else if (isTypeExtensionNode(definition)) {
        const typeName = definition.name.value;

        /**
         * This definition is an extension of an OBJECT type defined in another service.
         * TODO: handle extensions of non-object types?
         */
        if (
          definition.kind === Kind.OBJECT_TYPE_EXTENSION ||
          definition.kind === Kind.INPUT_OBJECT_TYPE_EXTENSION
        ) {
          if (!definition.fields) break;
          const fields = mapFieldNamesToServiceName<
            FieldDefinitionNode | InputValueDefinitionNode
          >(definition.fields, serviceName);

          /**
           * If the type already exists in the typeToServiceMap, add the extended fields. If not, create the object
           * and add the extensionFieldsToOwningServiceMap, but don't add a serviceName. That will be added once that service
           * definition is processed.
           */
          if (typeToServiceMap[typeName]) {
            typeToServiceMap[typeName].extensionFieldsToOwningServiceMap = {
              ...typeToServiceMap[typeName].extensionFieldsToOwningServiceMap,
              ...fields,
            };
          } else {
            typeToServiceMap[typeName] = {
              extensionFieldsToOwningServiceMap: fields,
            };
          }
        }

        if (definition.kind === Kind.ENUM_TYPE_EXTENSION) {
          if (!definition.values) break;

          const values = mapFieldNamesToServiceName(
            definition.values,
            serviceName,
          );

          if (typeToServiceMap[typeName]) {
            typeToServiceMap[typeName].extensionFieldsToOwningServiceMap = {
              ...typeToServiceMap[typeName].extensionFieldsToOwningServiceMap,
              ...values,
            };
          } else {
            typeToServiceMap[typeName] = {
              extensionFieldsToOwningServiceMap: values,
            };
          }
        }

        /**
         * If an extension for this type already exists in the extensions map, push this extension to the
         * array (since a type can be extended by multiple services). If not, create the extensions array
         * and add it to the typeExtensionsMap.
         */
        if (typeExtensionsMap[typeName]) {
          typeExtensionsMap[typeName].push({ ...definition, serviceName });
        } else {
          typeExtensionsMap[typeName] = [{ ...definition, serviceName }];
        }
      } else if (definition.kind === Kind.DIRECTIVE_DEFINITION) {
        const directiveName = definition.name.value;

        // The composed schema should only contain directives and their
        // ExecutableDirectiveLocations. This filters out any TypeSystemDirectiveLocations.
        // A new DirectiveDefinitionNode with this filtered list will be what is
        // added to the schema.
        const executableLocations = definition.locations.filter(location =>
          executableDirectiveLocations.includes(location.value),
        );

        // If none of the directive's locations are executable, we don't need to
        // include it in the composed schema at all.
        if (executableLocations.length === 0) continue;

        const definitionWithExecutableLocations: DirectiveDefinitionNode = {
          ...definition,
          locations: executableLocations,
        };

        if (directiveDefinitionsMap[directiveName]) {
          directiveDefinitionsMap[directiveName][
            serviceName
          ] = definitionWithExecutableLocations;
        } else {
          directiveDefinitionsMap[directiveName] = {
            [serviceName]: definitionWithExecutableLocations,
          };
        }
      }
    }
  }

  // Since all Query/Mutation definitions in service schemas are treated as
  // extensions, we don't have a Query or Mutation DEFINITION in the definitions
  // list. Without a Query/Mutation definition, we can't _extend_ the type.
  // extendSchema will complain about this. We can't add an empty
  // GraphQLObjectType to the schema constructor, so we add an empty definition
  // here. We only add mutation if there is a mutation extension though.
  if (!typeDefinitionsMap.Query)
    typeDefinitionsMap.Query = [EmptyQueryDefinition];
  if (typeExtensionsMap.Mutation && !typeDefinitionsMap.Mutation)
    typeDefinitionsMap.Mutation = [EmptyMutationDefinition];

  return {
    typeToServiceMap,
    typeDefinitionsMap,
    typeExtensionsMap,
    directiveDefinitionsMap,
    externalFields,
    keyDirectivesMap,
    valueTypes,
  };
}

export function buildSchemaFromDefinitionsAndExtensions({
  typeDefinitionsMap,
  typeExtensionsMap,
  directiveDefinitionsMap,
}: {
  typeDefinitionsMap: TypeDefinitionsMap;
  typeExtensionsMap: TypeExtensionsMap;
  directiveDefinitionsMap: DirectiveDefinitionsMap;
}) {
  let errors: GraphQLError[] | undefined = undefined;

  let schema = new GraphQLSchema({
    query: undefined,
    directives: [...specifiedDirectives, ...federationDirectives],
  });

  // This interface and predicate is a TS / graphql-js workaround for now while
  // we're using a local graphql version < v15. This predicate _could_ be:
  // `node is ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode` in the
  // future to be more semantic. However this gives us type safety and flexibility
  // for now.
  interface HasInterfaces {
    interfaces?: ObjectTypeDefinitionNode['interfaces'];
  }

  function nodeHasInterfaces(node: any): node is HasInterfaces {
    return 'interfaces' in node;
  }

  // Extend the blank schema with the base type definitions (as an AST node)
  const definitionsDocument: DocumentNode = {
    kind: Kind.DOCUMENT,
    definitions: [
      ...Object.values(typeDefinitionsMap).flatMap(typeDefinitions => {
        // See if any of our Objects or Interfaces implement any interfaces at all.
        // If not, we can return early.
        if (!typeDefinitions.some(nodeHasInterfaces)) return typeDefinitions;

        const uniqueInterfaces: Map<
          string,
          NamedTypeNode
        > = (typeDefinitions as HasInterfaces[]).reduce(
          (map, objectTypeDef) => {
            objectTypeDef.interfaces?.forEach((iface) =>
              map.set(iface.name.value, iface),
            );
            return map;
          },
          new Map(),
        );

        // No interfaces, no aggregation - just return what we got.
        if (uniqueInterfaces.size === 0) return typeDefinitions;

        const [first, ...rest] = typeDefinitions;

        return [
          ...rest,
          {
            ...first,
            interfaces: Array.from(uniqueInterfaces.values()),
          },
        ];

      }),
      ...Object.values(directiveDefinitionsMap).map(
        definitions => Object.values(definitions)[0],
      ),
    ],
  };

  errors = validateSDL(definitionsDocument, schema, compositionRules);
  schema = extendSchema(schema, definitionsDocument, { assumeValidSDL: true });

  // Extend the schema with the extension definitions (as an AST node)
  const extensionsDocument: DocumentNode = {
    kind: Kind.DOCUMENT,
    definitions: Object.values(typeExtensionsMap).flat(),
  };

  errors.push(...validateSDL(extensionsDocument, schema, compositionRules));

  schema = extendSchema(schema, extensionsDocument, { assumeValidSDL: true });

  // Remove federation directives from the final schema
  schema = new GraphQLSchema({
    ...schema.toConfig(),
    directives: [
      ...schema.getDirectives().filter(x => !isFederationDirective(x)),
    ],
  });

  return { schema, errors };
}

/**
 * Using the various information we've collected about the schema, augment the
 * `schema` itself with `federation` metadata to the types and fields
 */
export function addFederationMetadataToSchemaNodes({
  schema,
  typeToServiceMap,
  externalFields,
  keyDirectivesMap,
  valueTypes,
  directiveDefinitionsMap,
}: {
  schema: GraphQLSchema;
  typeToServiceMap: TypeToServiceMap;
  externalFields: ExternalFieldDefinition[];
  keyDirectivesMap: KeyDirectivesMap;
  valueTypes: ValueTypes;
  directiveDefinitionsMap: DirectiveDefinitionsMap;
}) {
  for (const [
    typeName,
    { owningService, extensionFieldsToOwningServiceMap },
  ] of Object.entries(typeToServiceMap)) {
    const namedType = schema.getType(typeName) as GraphQLNamedType;
    if (!namedType) continue;

    // Extend each type in the GraphQLSchema with the serviceName that owns it
    // and the key directives that belong to it
    const isValueType = valueTypes.has(typeName);
    const serviceName = isValueType ? null : owningService;

    const federationMetadata: FederationType = {
      ...getFederationMetadata(namedType),
      serviceName,
      isValueType,
      ...(keyDirectivesMap[typeName] && {
        keys: keyDirectivesMap[typeName],
      }),
    }

    namedType.extensions = {
      ...namedType.extensions,
      federation: federationMetadata,
    };

    // For object types, add metadata for all the @provides directives from its fields
    if (isObjectType(namedType)) {
      for (const field of Object.values(namedType.getFields())) {
        const [providesDirective] = findDirectivesOnTypeOrField(
          field.astNode,
          'provides',
        );

        if (
          providesDirective &&
          providesDirective.arguments &&
          isStringValueNode(providesDirective.arguments[0].value)
        ) {
          const fieldFederationMetadata: FederationField = {
            ...getFederationMetadata(field),
            serviceName,
            provides: parseSelections(
              providesDirective.arguments[0].value.value,
            ),
            belongsToValueType: isValueType,
          }

          field.extensions = {
            ...field.extensions,
            federation: fieldFederationMetadata
          };
        }
      }
    }

    /**
     * For extension fields, do 2 things:
     * 1. Add serviceName metadata to all fields that belong to a type extension
     * 2. add metadata from the @requires directive for each field extension
     */
    for (const [fieldName, extendingServiceName] of Object.entries(
      extensionFieldsToOwningServiceMap,
    )) {
      // TODO: Why don't we need to check for non-object types here
      if (isObjectType(namedType)) {
        const field = namedType.getFields()[fieldName];

        const fieldFederationMetadata: FederationField = {
          ...getFederationMetadata(field),
          serviceName: extendingServiceName,
        }

        field.extensions = {
          ...field.extensions,
          federation: fieldFederationMetadata,
        };

        const [requiresDirective] = findDirectivesOnTypeOrField(
          field.astNode,
          'requires',
        );

        if (
          requiresDirective &&
          requiresDirective.arguments &&
          isStringValueNode(requiresDirective.arguments[0].value)
        ) {
          const fieldFederationMetadata: FederationField = {
            ...getFederationMetadata(field),
            requires: parseSelections(
              requiresDirective.arguments[0].value.value,
            ),
          }

          field.extensions = {
            ...field.extensions,
            federation: fieldFederationMetadata,
          };
        }
      }
    }
  }
  // add externals metadata
  for (const field of externalFields) {
    const namedType = schema.getType(field.parentTypeName);
    if (!namedType) continue;

    const existingMetadata = getFederationMetadata(namedType);
    const typeFederationMetadata: FederationType = {
      ...existingMetadata,
      externals: {
        ...existingMetadata?.externals,
        [field.serviceName]: [
          ...(existingMetadata?.externals?.[field.serviceName] || []),
          field,
        ],
      },
    };

    namedType.extensions = {
      ...namedType.extensions,
      federation: typeFederationMetadata,
    };
  }

  // add all definitions of a specific directive for validation later
  for (const directiveName of Object.keys(directiveDefinitionsMap)) {
    const directive = schema.getDirective(directiveName);
    if (!directive) continue;

    const directiveFederationMetadata: FederationDirective = {
      ...getFederationMetadata(directive),
      directiveDefinitions: directiveDefinitionsMap[directiveName],
    }

    directive.extensions = {
      ...directive.extensions,
      federation: directiveFederationMetadata,
    }
  }
}

export function composeServices(services: ServiceDefinition[]) {
  const {
    typeToServiceMap,
    typeDefinitionsMap,
    typeExtensionsMap,
    directiveDefinitionsMap,
    externalFields,
    keyDirectivesMap,
    valueTypes,
  } = buildMapsFromServiceList(services);

  let { schema, errors } = buildSchemaFromDefinitionsAndExtensions({
    typeDefinitionsMap,
    typeExtensionsMap,
    directiveDefinitionsMap,
  });

  // TODO: We should fix this to take non-default operation root types in
  // implementing services into account.
  schema = new GraphQLSchema({
    ...schema.toConfig(),
    ...mapValues(defaultRootOperationNameLookup, typeName =>
      typeName
        ? (schema.getType(typeName) as GraphQLObjectType<any, any>)
        : undefined,
    ),
    extensions: {
      serviceList: services
    }
  });

  // If multiple type definitions and extensions for the same type implement the
  // same interface, it will get added to the constructed object multiple times,
  // resulting in a schema validation error. We therefore need to remove
  // duplicate interfaces from object types manually.
  schema = transformSchema(schema, type => {
    if (isObjectType(type)) {
      const config = type.toConfig();
      return new GraphQLObjectType({
        ...config,
        interfaces: Array.from(new Set(config.interfaces)),
      });
    }
    return undefined;
  });

  addFederationMetadataToSchemaNodes({
    schema,
    typeToServiceMap,
    externalFields,
    keyDirectivesMap,
    valueTypes,
    directiveDefinitionsMap,
  });

  /**
   * At the end, we're left with a full GraphQLSchema that _also_ has `serviceName` fields for every type,
   * and every field that was extended. Fields that were _not_ extended (added on the base type by the owner),
   * there is no `serviceName`, and we should refer to the type's `serviceName`
   */
  return { schema: schema as ComposedGraphQLSchema, errors };
}
