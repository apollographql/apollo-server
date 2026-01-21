import { describe, it, expect } from '@jest/globals';
import {
  validate,
  buildSchema,
  specifiedRules,
  parse,
  GraphQLError,
} from 'graphql';
import { createMaxRecursiveSelectionsRule } from '../../validationRules/index.js';

describe('selection limit tests', () => {
  it('selection limit threshold', () => {
    const schema = buildSchema(`
      type Query {
        user: User
      }

      type User {
        id: ID
        name: String
        email: String
        age: Int
        address: String
        phone: String
      }
    `);

    const query = `
      query {
        user {
          id
          name
          ...UserDetails
        }
      }

      fragment UserDetails on User {
        email
        age
        ...MoreDetails
      }

      fragment MoreDetails on User {
        address
        phone
      }
    `;

    const biggerQuery = `
      query {
        user {
          email
          age
          address
          phone
          ...UserDetails
        }
      }

      fragment UserDetails on User {
        id
        name
        email
        age
        ...MoreDetails
      }

      fragment MoreDetails on User {
        id
        name
        address
        phone
      }
    `;

    const selectionLimitRule = createMaxRecursiveSelectionsRule(10);

    // check the one that exceeds first to ensure that field count gets reset in between validations
    let errors = validate(schema, parse(biggerQuery), [
      ...specifiedRules,
      selectionLimitRule,
    ]);
    expect(errors).toEqual([
      new GraphQLError(
        'Anonymous operation recursively requests too many selections.',
      ),
    ]);

    errors = validate(schema, parse(query), [
      ...specifiedRules,
      selectionLimitRule,
    ]);
    expect(errors).toEqual([]);
  });
});
