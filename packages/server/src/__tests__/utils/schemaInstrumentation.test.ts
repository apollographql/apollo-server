import { describe, expect, it, jest } from '@jest/globals';
import { whenResultIsFinished } from '../../utils/schemaInstrumentation';

describe('whenResultIsFinished', () => {
  it('passes result of Promise to the callback', async () => {
    const expected = 1;
    const result = Promise.resolve(expected);
    const callback = jest.fn();
    whenResultIsFinished(result, callback);
    await new Promise((r) => setImmediate(r));
    expect(callback).toBeCalledWith(null, expected);
  });
  it('passes result of Array of Promises to the callback', async () => {
    const expected = 1;
    const result = [Promise.resolve(expected)];
    const callback = jest.fn();
    whenResultIsFinished(result, callback);
    await new Promise((r) => setImmediate(r));
    expect(callback).toBeCalledWith(null, [expected]);
  });
  it('passes result which is not asynchronous directly to the callback', async () => {
    const expected = 1;
    const result = expected;
    const callback = jest.fn();
    whenResultIsFinished(result, callback);
    await new Promise((r) => setImmediate(r));
    expect(callback).toBeCalledWith(null, expected);
  });
  it('passes result of Promise of Array of Promises to the callback', async () => {
    const expected = 1;
    const result = Promise.resolve([Promise.resolve(expected)]);
    const callback = jest.fn();
    whenResultIsFinished(result, callback);
    await new Promise((r) => setImmediate(r));
    expect(callback).toBeCalledWith(null, [expected]);
  });
});
