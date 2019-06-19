/* tslint:disable:no-unused-expression */

import { ApolloServerBase } from '../ApolloServer';

describe('Configuration', () => {
  it('should recognise parseOptions.allowLegacySDLEmptyFields as an option', () => {
    const typeDefs = `
        type Query { }
        extend type Query { _: Boolean }
        schema { query: Query }`;

    let message: string;
    try {
      new ApolloServerBase({ typeDefs });
    } catch (e) {
      message = e.message;
    }
    expect(message).toContain('Syntax Error: Expected Name, found }');

    new ApolloServerBase({
      typeDefs,
      parseOptions: {
        allowLegacySDLEmptyFields: true,
      },
    });
  });
});
