import gql from 'graphql-tag';
import { composeServices } from '../../../compose';
import { executableDirectivesIdentical } from '../';
import { graphqlErrorSerializer } from '../../../../snapshotSerializers';

expect.addSnapshotSerializer(graphqlErrorSerializer);

describe('executableDirectivesIdentical', () => {
  it('throws no errors when custom, executable directives are defined identically every service', () => {
    const serviceA = {
      typeDefs: gql`
        directive @stream on FIELD
        directive @instrument(tag: String!) on FIELD
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        directive @stream on FIELD
        directive @instrument(tag: String!) on FIELD
      `,
      name: 'serviceB',
    };

    const serviceList = [serviceA, serviceB];
    const { schema } = composeServices(serviceList);
    const errors = executableDirectivesIdentical({ schema, serviceList });
    expect(errors).toHaveLength(0);
  });

  it('throws no errors when directives (excluding their TypeSystemDirectiveLocations) are identical for every service', () => {
    const serviceA = {
      typeDefs: gql`
        directive @stream on FIELD
        directive @instrument(tag: String!) on FIELD | FIELD_DEFINITION
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        directive @stream on FIELD
        directive @instrument(tag: String!) on FIELD
      `,
      name: 'serviceB',
    };

    const serviceList = [serviceA, serviceB];
    const { schema } = composeServices(serviceList);
    const errors = executableDirectivesIdentical({ schema, serviceList });
    expect(errors).toHaveLength(0);
  });

  it("throws errors when custom, executable directives aren't defined with the same locations in every service", () => {
    const serviceA = {
      typeDefs: gql`
        directive @stream on FIELD
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        directive @stream on FIELD | QUERY
      `,
      name: 'serviceB',
    };

    const serviceC = {
      typeDefs: gql`
        directive @stream on INLINE_FRAGMENT
      `,
      name: 'serviceC',
    };

    const serviceList = [serviceA, serviceB, serviceC];
    const { schema } = composeServices(serviceList);
    const errors = executableDirectivesIdentical({ schema, serviceList });
    expect(errors).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "EXECUTABLE_DIRECTIVES_IDENTICAL",
          "message": "[@stream] -> custom directives must be defined identically across all services. See below for a list of current implementations:
      	serviceA: directive @stream on FIELD
      	serviceB: directive @stream on FIELD | QUERY
      	serviceC: directive @stream on INLINE_FRAGMENT",
        },
      ]
    `);
  });

  it("throws errors when custom, executable directives aren't defined with the same arguments in every service", () => {
    const serviceA = {
      typeDefs: gql`
        directive @instrument(tag: String!) on FIELD
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        directive @instrument(tag: Boolean) on FIELD
      `,
      name: 'serviceB',
    };

    const serviceList = [serviceA, serviceB];
    const { schema } = composeServices(serviceList);
    const errors = executableDirectivesIdentical({ schema, serviceList });
    expect(errors).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "EXECUTABLE_DIRECTIVES_IDENTICAL",
          "message": "[@instrument] -> custom directives must be defined identically across all services. See below for a list of current implementations:
      	serviceA: directive @instrument(tag: String!) on FIELD
      	serviceB: directive @instrument(tag: Boolean) on FIELD",
        },
      ]
    `);
  });
});
