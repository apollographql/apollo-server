import { deepMerge } from '../deepMerge';

describe('deepMerge', () => {
  it('merges basic', () => {
    const target = {
      a: 1,
      b: 2,
    };

    const source = {
      b: 3,
      c: 4,
    };

    expect(deepMerge(target, source)).toEqual({
      a: 1,
      b: 3,
      c: 4,
    });
  });

  it('merges nested objects', () => {
    const target = {
      a: 1,
      b: {
        someProperty: 1,
        overwrittenProperty: 'clean',
      },
    };

    const source = {
      b: {
        overwrittenProperty: 'dirty',
        newProperty: 'new',
      },
      c: 4,
    };

    expect(deepMerge(target, source)).toEqual({
      a: 1,
      b: {
        newProperty: 'new',
        overwrittenProperty: 'dirty',
        someProperty: 1,
      },
      c: 4,
    });
  });

  it('ignores merging __proto__ fields', () => {
    const target = {};

    // Bypass setters on __proto__
    const source = JSON.parse('{"__proto__": {"pollution": true}}');
    deepMerge(target, source);

    expect(Object.prototype.hasOwnProperty('pollution')).toBe(false);
  });

  it('merges arrays', () => {
    const target = {
      a: 1,
      b: [{ c: 1, d: 2 }],
    };

    const source = {
      e: 2,
      b: [{ f: 3 }],
    };

    expect(deepMerge(target, source)).toEqual({
      a: 1,
      e: 2,
      b: [{ c: 1, d: 2, f: 3 }],
    });
  });
});
