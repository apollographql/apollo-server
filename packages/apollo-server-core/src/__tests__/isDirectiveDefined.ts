import { gql } from '../';
import { isDirectiveDefined } from '../utils/isDirectiveDefined';

describe('isDirectiveDefined', () => {
  it('returns false when a directive is not defined', () => {
    expect(
      isDirectiveDefined(
        [
          gql`
            type Query {
              hello: String
            }
          `,
        ],
        'cacheControl',
      ),
    ).toBe(false);
  });

  it('returns true when a directive is defined', () => {
    expect(
      isDirectiveDefined(
        [
          gql`
            type Query {
              hello: String
            }

            enum CacheControlScope {
              PUBLIC
              PRIVATE
            }

            directive @cacheControl(
              maxAge: Int
              scope: CacheControlScope
            ) on FIELD_DEFINITION | OBJECT | INTERFACE
          `,
        ],
        'cacheControl',
      ),
    ).toBe(true);
  });
});
