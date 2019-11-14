import gql from 'graphql-tag';
import { composeServices } from '../../../compose';
import { executableDirectivesOnly } from '../';
import { graphqlErrorSerializer } from '../../../../snapshotSerializers';

expect.addSnapshotSerializer(graphqlErrorSerializer);

describe('executableDirectivesOnly', () => {
  it('throws no errors when custom, executable directives are defined', () => {
    const serviceA = {
      typeDefs: gql`
        directive @query on QUERY
        directive @mutation on MUTATION
        directive @subscription on SUBSCRIPTION
        directive @field on FIELD
        directive @fragmentDefinition on FRAGMENT_DEFINITION
        directive @fragmentSpread on FRAGMENT_SPREAD
        directive @inlineFragment on INLINE_FRAGMENT
        directive @variableDefinition on VARIABLE_DEFINITION
      `,
      name: 'serviceA',
    };

    const serviceList = [serviceA];
    const { schema } = composeServices(serviceList);
    const errors = executableDirectivesOnly({ schema, serviceList });
    expect(errors).toHaveLength(0);
  });

  it('throws errors when custom, type system directives are defined', () => {
    const serviceA = {
      typeDefs: gql`
        directive @schema on SCHEMA
        directive @scalar on SCALAR
        directive @object on OBJECT
        directive @fieldDefinition on FIELD_DEFINITION
        directive @argumentDefinition on ARGUMENT_DEFINITION
        directive @interface on INTERFACE
        directive @union on UNION
        directive @enum on ENUM
        directive @enumValue on ENUM_VALUE
        directive @inputObject on INPUT_OBJECT
        directive @inputFieldDefinition on INPUT_FIELD_DEFINITION
      `,
      name: 'serviceA',
    };

    const serviceList = [serviceA];
    const { schema } = composeServices(serviceList);
    const errors = executableDirectivesOnly({ schema, serviceList });
    expect(errors).toHaveLength(11);
    expect(errors).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "EXECUTABLE_DIRECTIVES_ONLY",
          "message": "[serviceA] @schema -> is a type system directive, but only executable directives are permitted. Executable directives exist for the following locations: QUERY, MUTATION, SUBSCRIPTION, FIELD, FRAGMENT_DEFINITION, FRAGMENT_SPREAD, INLINE_FRAGMENT, VARIABLE_DEFINITION",
        },
        Object {
          "code": "EXECUTABLE_DIRECTIVES_ONLY",
          "message": "[serviceA] @scalar -> is a type system directive, but only executable directives are permitted. Executable directives exist for the following locations: QUERY, MUTATION, SUBSCRIPTION, FIELD, FRAGMENT_DEFINITION, FRAGMENT_SPREAD, INLINE_FRAGMENT, VARIABLE_DEFINITION",
        },
        Object {
          "code": "EXECUTABLE_DIRECTIVES_ONLY",
          "message": "[serviceA] @object -> is a type system directive, but only executable directives are permitted. Executable directives exist for the following locations: QUERY, MUTATION, SUBSCRIPTION, FIELD, FRAGMENT_DEFINITION, FRAGMENT_SPREAD, INLINE_FRAGMENT, VARIABLE_DEFINITION",
        },
        Object {
          "code": "EXECUTABLE_DIRECTIVES_ONLY",
          "message": "[serviceA] @fieldDefinition -> is a type system directive, but only executable directives are permitted. Executable directives exist for the following locations: QUERY, MUTATION, SUBSCRIPTION, FIELD, FRAGMENT_DEFINITION, FRAGMENT_SPREAD, INLINE_FRAGMENT, VARIABLE_DEFINITION",
        },
        Object {
          "code": "EXECUTABLE_DIRECTIVES_ONLY",
          "message": "[serviceA] @argumentDefinition -> is a type system directive, but only executable directives are permitted. Executable directives exist for the following locations: QUERY, MUTATION, SUBSCRIPTION, FIELD, FRAGMENT_DEFINITION, FRAGMENT_SPREAD, INLINE_FRAGMENT, VARIABLE_DEFINITION",
        },
        Object {
          "code": "EXECUTABLE_DIRECTIVES_ONLY",
          "message": "[serviceA] @interface -> is a type system directive, but only executable directives are permitted. Executable directives exist for the following locations: QUERY, MUTATION, SUBSCRIPTION, FIELD, FRAGMENT_DEFINITION, FRAGMENT_SPREAD, INLINE_FRAGMENT, VARIABLE_DEFINITION",
        },
        Object {
          "code": "EXECUTABLE_DIRECTIVES_ONLY",
          "message": "[serviceA] @union -> is a type system directive, but only executable directives are permitted. Executable directives exist for the following locations: QUERY, MUTATION, SUBSCRIPTION, FIELD, FRAGMENT_DEFINITION, FRAGMENT_SPREAD, INLINE_FRAGMENT, VARIABLE_DEFINITION",
        },
        Object {
          "code": "EXECUTABLE_DIRECTIVES_ONLY",
          "message": "[serviceA] @enum -> is a type system directive, but only executable directives are permitted. Executable directives exist for the following locations: QUERY, MUTATION, SUBSCRIPTION, FIELD, FRAGMENT_DEFINITION, FRAGMENT_SPREAD, INLINE_FRAGMENT, VARIABLE_DEFINITION",
        },
        Object {
          "code": "EXECUTABLE_DIRECTIVES_ONLY",
          "message": "[serviceA] @enumValue -> is a type system directive, but only executable directives are permitted. Executable directives exist for the following locations: QUERY, MUTATION, SUBSCRIPTION, FIELD, FRAGMENT_DEFINITION, FRAGMENT_SPREAD, INLINE_FRAGMENT, VARIABLE_DEFINITION",
        },
        Object {
          "code": "EXECUTABLE_DIRECTIVES_ONLY",
          "message": "[serviceA] @inputObject -> is a type system directive, but only executable directives are permitted. Executable directives exist for the following locations: QUERY, MUTATION, SUBSCRIPTION, FIELD, FRAGMENT_DEFINITION, FRAGMENT_SPREAD, INLINE_FRAGMENT, VARIABLE_DEFINITION",
        },
        Object {
          "code": "EXECUTABLE_DIRECTIVES_ONLY",
          "message": "[serviceA] @inputFieldDefinition -> is a type system directive, but only executable directives are permitted. Executable directives exist for the following locations: QUERY, MUTATION, SUBSCRIPTION, FIELD, FRAGMENT_DEFINITION, FRAGMENT_SPREAD, INLINE_FRAGMENT, VARIABLE_DEFINITION",
        },
      ]
    `);
  });

  it('handles multiple services', () => {
    const serviceA = {
      typeDefs: gql`
        directive @stream on FIELD
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        directive @stream on FIELD
      `,
      name: 'serviceB',
    };

    const serviceList = [serviceA, serviceB];
    const { schema } = composeServices(serviceList);
    const errors = executableDirectivesOnly({ schema, serviceList });
    expect(errors).toHaveLength(0);

    const stream = schema.getDirective('stream');
    expect(stream).toMatchInlineSnapshot(`"@stream"`);
  });
});
