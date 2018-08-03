import { isDeferredExecutionResult } from '../execute';
import { forAwaitEach } from 'iterall';
import { StarWarsSchema } from './starWarsSchema';
import { graphql } from './graphql';
import { validate } from 'graphql';
import gql from 'graphql-tag';
import { CannotDeferNonNullableFields } from '../validationRules/CannotDeferNonNullableFields';

describe('@defer Directive tests', () => {
  describe('Compatibility', () => {
    it('Can disable @defer', async done => {
      const query = `
        query HeroNameQuery {
          hero {
            id
            name @defer
          }
        }
      `;
      try {
        const result = await graphql(StarWarsSchema, query, false);
        expect(isDeferredExecutionResult(result)).toBe(false);
        expect(result).toEqual({
          data: {
            hero: {
              id: '2001',
              name: 'R2-D2',
            },
          },
        });
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  describe('Basic Queries', () => {
    it('Can @defer on scalar types', async done => {
      const query = `
        query HeroNameQuery {
          hero {
            id
            name @defer
          }
        }
      `;
      try {
        const result = await graphql(StarWarsSchema, query);
        expect(isDeferredExecutionResult(result)).toBe(true);
        if (isDeferredExecutionResult(result)) {
          expect(result.initialResult).toEqual({
            data: {
              hero: {
                id: '2001',
                name: null,
              },
            },
          });

          const patches = [];
          await forAwaitEach(result.deferredPatches, patch => {
            patches.push(patch);
          });
          expect(patches.length).toBe(1);
          expect(patches).toContainEqual({
            path: ['hero', 'name'],
            data: 'R2-D2',
          });
          done();
        }
      } catch (error) {
        done(error);
      }
    });

    it('Can @defer on object types', async done => {
      const query = `
        query HeroNameQuery {
          human(id: "1000") {
            id
            weapon @defer {
              name
              strength
            }
          }
        }
      `;
      try {
        const result = await graphql(StarWarsSchema, query);
        expect(isDeferredExecutionResult(result)).toBe(true);
        if (isDeferredExecutionResult(result)) {
          expect(result.initialResult).toEqual({
            data: {
              human: {
                id: '1000',
                weapon: null,
              },
            },
          });
          const patches = [];
          await forAwaitEach(result.deferredPatches, patch => {
            patches.push(patch);
          });
          expect(patches.length).toBe(1);
          expect(patches).toContainEqual({
            data: { name: 'Light Saber', strength: 'High' },
            path: ['human', 'weapon'],
          });
          done();
        }
      } catch (error) {
        done(error);
      }
    });

    it('Can @defer on a field on a list type', async done => {
      const query = `
        query HeroNameAndFriendsQuery {
          hero {
            id
            name 
            friends {
              name @defer
            }
          }
        }
      `;
      try {
        const result = await graphql(StarWarsSchema, query);
        expect(isDeferredExecutionResult(result)).toBe(true);
        if (isDeferredExecutionResult(result)) {
          expect(result.initialResult).toEqual({
            data: {
              hero: {
                id: '2001',
                name: 'R2-D2',
                friends: [{ name: null }, { name: null }, { name: null }],
              },
            },
          });
          const patches = [];
          await forAwaitEach(result.deferredPatches, patch => {
            patches.push(patch);
          });
          expect(patches.length).toBe(3);
          expect(patches).toContainEqual({
            path: ['hero', 'friends', 0, 'name'],
            data: 'Luke Skywalker',
          });
          expect(patches).toContainEqual({
            path: ['hero', 'friends', 1, 'name'],
            data: 'Han Solo',
          });
          expect(patches).toContainEqual({
            path: ['hero', 'friends', 2, 'name'],
            data: 'Leia Organa',
          });
          done();
        }
      } catch (error) {
        done(error);
      }
    });

    it('Can @defer on list type', async done => {
      const query = `
        query HeroNameAndFriendsQuery {
          hero {
            id
            name 
            friends @defer {
              name
            }
          }
        }
      `;
      try {
        const result = await graphql(StarWarsSchema, query);
        expect(isDeferredExecutionResult(result)).toBe(true);
        if (isDeferredExecutionResult(result)) {
          expect(result.initialResult).toEqual({
            data: {
              hero: {
                id: '2001',
                name: 'R2-D2',
                friends: null,
              },
            },
          });
          const patches = [];
          await forAwaitEach(result.deferredPatches, patch => {
            patches.push(patch);
          });
          expect(patches.length).toBe(1);
          expect(patches).toContainEqual({
            path: ['hero', 'friends'],
            data: [
              { name: 'Luke Skywalker' },
              { name: 'Han Solo' },
              { name: 'Leia Organa' },
            ],
          });
          done();
        }
      } catch (error) {
        done(error);
      }
    });
  });
  describe('Nested Queries', () => {
    it('Can @defer on nested queries', async done => {
      const query = `
        query NestedQuery {
          hero {
            name
            appearsIn @defer
            friends {
              name
              appearsIn
              friends {
                name @defer
              }
            }
          }
        }
      `;
      try {
        const result = await graphql(StarWarsSchema, query);
        expect(isDeferredExecutionResult(result)).toBe(true);
        if (isDeferredExecutionResult(result)) {
          expect(result.initialResult).toEqual({
            data: {
              hero: {
                name: 'R2-D2',
                appearsIn: null,
                friends: [
                  {
                    name: 'Luke Skywalker',
                    appearsIn: ['NEWHOPE', 'EMPIRE', 'JEDI'],
                    friends: [
                      { name: null },
                      { name: null },
                      { name: null },
                      { name: null },
                    ],
                  },
                  {
                    name: 'Han Solo',
                    appearsIn: ['NEWHOPE', 'EMPIRE', 'JEDI'],
                    friends: [{ name: null }, { name: null }, { name: null }],
                  },
                  {
                    name: 'Leia Organa',
                    appearsIn: ['NEWHOPE', 'EMPIRE', 'JEDI'],
                    friends: [
                      { name: null },
                      { name: null },
                      { name: null },
                      { name: null },
                    ],
                  },
                ],
              },
            },
          });
          const patches = [];
          await forAwaitEach(result.deferredPatches, patch => {
            patches.push(patch);
          });
          expect(patches.length).toBe(12);
          expect(patches).toContainEqual({
            path: ['hero', 'friends', 0, 'friends', 0, 'name'],
            data: 'Han Solo',
          });
          expect(patches).toContainEqual({
            path: ['hero', 'appearsIn'],
            data: ['NEWHOPE', 'EMPIRE', 'JEDI'],
          });
          done();
        }
      } catch (error) {
        done(error);
      }
    });

    it('Can @defer on fields nested within deferred fields, ensuring ordering', async done => {
      const query = `
        query NestedQuery {
          human(id: "1000") {
            name
            weapon @defer {
              name @defer
              strength
            }
          }
        }
      `;
      try {
        const result = await graphql(StarWarsSchema, query);
        expect(isDeferredExecutionResult(result)).toBe(true);
        if (isDeferredExecutionResult(result)) {
          expect(result.initialResult).toEqual({
            data: {
              human: {
                name: 'Luke Skywalker',
                weapon: null,
              },
            },
          });
          const patches = [];
          await forAwaitEach(result.deferredPatches, patch => {
            patches.push(patch);
          });
          // Ensure that ordering constraint is met: parent patches should
          // be returned before child patches.
          expect(patches).toEqual([
            {
              path: ['human', 'weapon'],
              data: {
                strength: 'High',
                name: null,
              },
            },
            {
              path: ['human', 'weapon', 'name'],
              data: 'Light Saber',
            },
          ]);
          done();
        }
      } catch (error) {
        done(error);
      }
    });

    it('Can @defer on fields nested within deferred lists', async done => {
      const query = `
        query NestedQuery {
          human(id: "1002") {
            name
            friends @defer {
              id
              name @defer
            }
          }
        }
      `;
      try {
        const result = await graphql(StarWarsSchema, query);
        expect(isDeferredExecutionResult(result)).toBe(true);
        if (isDeferredExecutionResult(result)) {
          expect(result.initialResult).toEqual({
            data: {
              human: {
                name: 'Han Solo',
                friends: null,
              },
            },
          });
          const patches = [];
          await forAwaitEach(result.deferredPatches, patch => {
            patches.push(patch);
          });
          expect(patches.length).toBe(4);
          expect(patches).toContainEqual({
            path: ['human', 'friends'],
            data: [
              {
                id: '1000',
                name: null,
              },
              {
                id: '1003',
                name: null,
              },
              {
                id: '2001',
                name: null,
              },
            ],
          });
          expect(patches).toContainEqual({
            path: ['human', 'friends', 0, 'name'],
            data: 'Luke Skywalker',
          });
          done();
        }
      } catch (error) {
        done(error);
      }
    });

    it('Can @defer on more nested queries', async done => {
      const query = `
        query NestedQuery {
          hero {
            name
            friends @defer {
              id
              name @defer
              friends @defer {
                name
              }
            }
          }
        }
      `;
      try {
        const result = await graphql(StarWarsSchema, query);
        expect(isDeferredExecutionResult(result)).toBe(true);
        if (isDeferredExecutionResult(result)) {
          expect(result.initialResult).toEqual({
            data: {
              hero: {
                name: 'R2-D2',
                friends: null,
              },
            },
          });
          const patches = [];
          await forAwaitEach(result.deferredPatches, patch => {
            patches.push(patch);
          });
          expect(patches.length).toBe(7);
          expect(patches).toContainEqual({
            path: ['hero', 'friends'],
            data: [
              {
                id: '1000',
                name: null,
                friends: null,
              },
              {
                id: '1002',
                name: null,
                friends: null,
              },
              {
                id: '1003',
                name: null,
                friends: null,
              },
            ],
          });
          expect(patches).toContainEqual({
            path: ['hero', 'friends', 0, 'name'],
            data: 'Luke Skywalker',
          });
          expect(patches).toContainEqual({
            path: ['hero', 'friends', 0, 'friends'],
            data: [
              {
                name: 'Han Solo',
              },
              {
                name: 'Leia Organa',
              },
              {
                name: 'C-3PO',
              },
              {
                name: 'R2-D2',
              },
            ],
          });
          done();
        }
      } catch (error) {
        done(error);
      }
    });
  });

  describe('Error Handling', () => {
    it('Errors on a deferred field returned in the patch', async done => {
      const query = `
        query HeroNameQuery {
          hero {
            name
            secretBackstory @defer
          }
        }
      `;
      try {
        const result = await graphql(StarWarsSchema, query);
        expect(isDeferredExecutionResult(result)).toBe(true);
        if (isDeferredExecutionResult(result)) {
          expect(result.initialResult).toEqual({
            data: {
              hero: {
                name: 'R2-D2',
                secretBackstory: null,
              },
            },
          });
          const patches = [];
          await forAwaitEach(result.deferredPatches, patch => {
            patches.push(patch);
          });
          expect(patches.length).toBe(1);
          expect(JSON.stringify(patches[0])).toBe(
            JSON.stringify({
              path: ['hero', 'secretBackstory'],
              data: null,
              errors: [
                {
                  message: 'secretBackstory is secret.',
                  locations: [{ line: 5, column: 13 }],
                  path: ['hero', 'secretBackstory'],
                },
              ],
            }),
          );
          done();
        }
      } catch (error) {
        done(error);
      }
    });

    it('Errors inside deferred field returned with patch for the deferred field', async done => {
      const query = `
        query HeroNameQuery {
          hero {
            name
            friends @defer {
              name
              secretBackstory
            }
          }
        }
      `;
      try {
        const result = await graphql(StarWarsSchema, query);
        expect(isDeferredExecutionResult(result)).toBe(true);
        if (isDeferredExecutionResult(result)) {
          expect(result.initialResult).toEqual({
            data: {
              hero: {
                name: 'R2-D2',
                friends: null,
              },
            },
          });
          const patches = [];
          await forAwaitEach(result.deferredPatches, patch => {
            patches.push(patch);
          });
          expect(patches.length).toBe(1);
          expect(JSON.stringify(patches[0])).toBe(
            JSON.stringify({
              path: ['hero', 'friends'],
              data: [
                {
                  name: 'Luke Skywalker',
                  secretBackstory: null,
                },
                {
                  name: 'Han Solo',
                  secretBackstory: null,
                },
                {
                  name: 'Leia Organa',
                  secretBackstory: null,
                },
              ],
              errors: [
                {
                  message: 'secretBackstory is secret.',
                  locations: [
                    {
                      line: 7,
                      column: 15,
                    },
                  ],
                  path: ['hero', 'friends', 0, 'secretBackstory'],
                },
                {
                  message: 'secretBackstory is secret.',
                  locations: [
                    {
                      line: 7,
                      column: 15,
                    },
                  ],
                  path: ['hero', 'friends', 1, 'secretBackstory'],
                },
                {
                  message: 'secretBackstory is secret.',
                  locations: [
                    {
                      line: 7,
                      column: 15,
                    },
                  ],
                  path: ['hero', 'friends', 2, 'secretBackstory'],
                },
              ],
            }),
          );
          done();
        }
      } catch (error) {
        done(error);
      }
    });
  });

  describe('Non-nullable fields', () => {
    it('Throws validation error if @defer used on non-nullable field', () => {
      const query = gql`
        query HeroIdQuery {
          hero {
            id @defer
            name
          }
        }
      `;
      const validationErrors = validate(StarWarsSchema, query, [
        CannotDeferNonNullableFields,
      ]);
      expect(validationErrors.toString()).toEqual(
        '@defer cannot be applied on non-nullable field "Character.id".',
      );
    });

    // Failing validation, a runtime error is still thrown

    it('Throws error if @defer used on non-nullable field', async done => {
      const query = `
        query HeroIdQuery {
          hero {
            id @defer
            name
          }
        }
      `;
      try {
        const result = await graphql(StarWarsSchema, query);
        expect(isDeferredExecutionResult(result)).toBe(false);
        expect(JSON.stringify(result)).toBe(
          JSON.stringify({
            errors: [
              {
                message:
                  '@defer cannot be applied on non-nullable field Droid.id',
                locations: [
                  {
                    line: 4,
                    column: 13,
                  },
                ],
                path: ['hero', 'id'],
              },
            ],
            data: {
              hero: null,
            },
          }),
        );
        done();
      } catch (error) {
        done(error);
      }
    });

    it('Can @defer on parent of a non-nullable field', async done => {
      const query = `
        query HeroNonNullQuery {
          human(id: "1001") @defer {
            id 
            name
            nonNullField
          }
        }
      `;
      try {
        const result = await graphql(StarWarsSchema, query);
        expect(isDeferredExecutionResult(result)).toBe(true);
        if (isDeferredExecutionResult(result)) {
          expect(result.initialResult).toEqual({
            data: { human: null },
          });
          const patches = [];
          await forAwaitEach(result.deferredPatches, patch => {
            patches.push(patch);
          });
          expect(patches.length).toBe(1);
          expect(JSON.stringify(patches[0])).toBe(
            JSON.stringify({
              path: ['human'],
              data: {
                id: '1001',
                name: 'Darth Vader',
                nonNullField: null,
              },
              errors: [
                {
                  message:
                    'Cannot return null for non-nullable field Human.nonNullField.',
                  locations: [
                    {
                      line: 6,
                      column: 13,
                    },
                  ],
                  path: ['human', 'nonNullField'],
                },
              ],
            }),
          );
          done();
        }
      } catch (error) {
        done(error);
      }
    });

    it('Can @defer on child of a non-nullable field', async done => {
      const query = `
        query HeroSoulmateQuery {
          human(id: "1000") {
            id 
            name
            soulmate {
              name @defer
            }
          }
        }
      `;
      try {
        const result = await graphql(StarWarsSchema, query);
        expect(isDeferredExecutionResult(result)).toBe(true);
        if (isDeferredExecutionResult(result)) {
          expect(result.initialResult).toEqual({
            data: {
              human: {
                id: '1000',
                name: 'Luke Skywalker',
                soulmate: { name: null },
              },
            },
          });
          const patches = [];
          await forAwaitEach(result.deferredPatches, patch => {
            patches.push(patch);
          });
          expect(patches.length).toBe(1);
          expect(JSON.stringify(patches[0])).toBe(
            JSON.stringify({
              path: ['human', 'soulmate', 'name'],
              data: 'Darth Vader',
            }),
          );
          done();
        }
      } catch (error) {
        done(error);
      }
    });

    it('Throws error if @defer used on nested non-nullable field', async done => {
      const query = `
        query HeroSoulmateQuery {
          human(id: "1002") {
            id 
            name
            soulmate {
              id @defer
            }
          }
        }
      `;
      try {
        const result = await graphql(StarWarsSchema, query);
        expect(isDeferredExecutionResult(result)).toBe(false);
        expect(result).toEqual({
          errors: [
            {
              message:
                '@defer cannot be applied on non-nullable field Human.id',
              locations: [
                {
                  line: 7,
                  column: 15,
                },
              ],
              path: ['human', 'soulmate', 'id'],
            },
          ],
          data: {
            human: null,
          },
        });
        done();
      } catch (error) {
        done(error);
      }
    });
  });
  describe('With Fragments', () => {
    it('Can @defer fields in fragment', async done => {
      const query = `
        query HeroNameQuery {
          hero {
            ...BasicInfo
          }
        }
        fragment BasicInfo on Character {
          id
          name @defer
        }
      `;
      try {
        const result = await graphql(StarWarsSchema, query);
        expect(isDeferredExecutionResult(result)).toBe(true);
        if (isDeferredExecutionResult(result)) {
          expect(result.initialResult).toEqual({
            data: {
              hero: {
                id: '2001',
                name: null,
              },
            },
          });

          const patches = [];
          await forAwaitEach(result.deferredPatches, patch => {
            patches.push(patch);
          });
          expect(patches.length).toBe(1);
          expect(patches).toContainEqual({
            path: ['hero', 'name'],
            data: 'R2-D2',
          });
          done();
        }
      } catch (error) {
        done(error);
      }
    });

    it('All copies of a field need to specify defer', async done => {
      const query = `
        query HeroNameQuery {
          hero {
            name
            ...BasicInfo
          }
        }
        fragment BasicInfo on Character {
          id
          name @defer
        }
      `;
      try {
        const result = await graphql(StarWarsSchema, query);
        expect(result).toEqual({
          data: {
            hero: {
              name: 'R2-D2',
              id: '2001',
            },
          },
        });
        done();
      } catch (error) {
        done(error);
      }
    });

    it('All copies of a field need to specify defer', async done => {
      const query = `
        query HeroNameQuery {
          hero {
            name @defer
            ...BasicInfo
          }
        }
        fragment BasicInfo on Character {
          id
          name @defer
        }
      `;
      try {
        const result = await graphql(StarWarsSchema, query);
        expect(isDeferredExecutionResult(result)).toBe(true);
        if (isDeferredExecutionResult(result)) {
          expect(result.initialResult).toEqual({
            data: {
              hero: {
                id: '2001',
                name: null,
              },
            },
          });

          const patches = [];
          await forAwaitEach(result.deferredPatches, patch => {
            patches.push(patch);
          });
          expect(patches.length).toBe(1);
          expect(patches).toContainEqual({
            path: ['hero', 'name'],
            data: 'R2-D2',
          });
          done();
        }
      } catch (error) {
        done(error);
      }
    });

    it('Can @defer fields in a fragment on a list type', async done => {
      const query = `
        query HeroNameAndFriendsQuery {
          hero {
            id
            name 
            friends {
              ...Name
            }
          }
        }
        fragment Name on Character {
          name @defer
        }
      `;
      try {
        const result = await graphql(StarWarsSchema, query);
        expect(isDeferredExecutionResult(result)).toBe(true);
        if (isDeferredExecutionResult(result)) {
          expect(result.initialResult).toEqual({
            data: {
              hero: {
                id: '2001',
                name: 'R2-D2',
                friends: [{ name: null }, { name: null }, { name: null }],
              },
            },
          });
          const patches = [];
          await forAwaitEach(result.deferredPatches, patch => {
            patches.push(patch);
          });
          expect(patches.length).toBe(3);
          expect(patches).toContainEqual({
            path: ['hero', 'friends', 0, 'name'],
            data: 'Luke Skywalker',
          });
          expect(patches).toContainEqual({
            path: ['hero', 'friends', 1, 'name'],
            data: 'Han Solo',
          });
          expect(patches).toContainEqual({
            path: ['hero', 'friends', 2, 'name'],
            data: 'Leia Organa',
          });
          done();
        }
      } catch (error) {
        done(error);
      }
    });
  });
});
