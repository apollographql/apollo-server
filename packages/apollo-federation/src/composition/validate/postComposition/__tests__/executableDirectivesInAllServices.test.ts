import gql from 'graphql-tag';
import { composeServices } from '../../../compose';
import { executableDirectivesInAllServices } from '../';
import { graphqlErrorSerializer } from '../../../../snapshotSerializers';

expect.addSnapshotSerializer(graphqlErrorSerializer);

describe('executableDirectivesInAllServices', () => {
  it('throws no errors when custom, executable directives are defined in every service', () => {
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
    const errors = executableDirectivesInAllServices({ schema, serviceList });
    expect(errors).toHaveLength(0);
  });

  it("throws no errors when type system directives aren't defined in every service", () => {
    const serviceA = {
      typeDefs: gql`
        directive @stream on FIELD
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        directive @stream on FIELD
        # This directive is ignored by composition and therefore post-composition validators
        directive @ignored on FIELD_DEFINITION
      `,
      name: 'serviceB',
    };

    const serviceList = [serviceA, serviceB];
    const { schema } = composeServices(serviceList);
    const errors = executableDirectivesInAllServices({ schema, serviceList });
    expect(errors).toHaveLength(0);
  });

  it("throws errors when custom, executable directives aren't defined in every service", () => {
    const serviceA = {
      typeDefs: gql`
        directive @stream on FIELD
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Query {
          thing: String
        }
      `,
      name: 'serviceB',
    };

    const serviceC = {
      typeDefs: gql`
        extend type Query {
          otherThing: String
        }
      `,
      name: 'serviceC',
    };

    const serviceList = [serviceA, serviceB, serviceC];
    const { schema } = composeServices(serviceList);
    const errors = executableDirectivesInAllServices({ schema, serviceList });
    expect(errors).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "EXECUTABLE_DIRECTIVES_IN_ALL_SERVICES",
          "message": "[@stream] -> Custom directives must be implemented in every service. The following services do not implement the @stream directive: serviceB, serviceC.",
        },
      ]
    `);
  });
});
