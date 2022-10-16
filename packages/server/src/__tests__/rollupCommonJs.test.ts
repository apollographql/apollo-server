import { describe, expect, it } from '@jest/globals';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';
import { rollup, OutputOptions } from 'rollup';

describe('@rollup/plugin-commonjs', () => {
  it('bundles into es6 without circular dependencies issues', async () => {
    const outputOptions: OutputOptions = {
      exports: 'named',
      name: 'apollo',
      format: 'umd',
    };
    const bundle = await rollup({
      input: path.resolve(__dirname, '..', '..', 'dist', 'cjs', 'index.js'),
      plugins: [commonjs()],
      onwarn: () => {
        /* suppress warnings */
      },
    });
    const { output } = await bundle.generate(outputOptions);
    await bundle.close();
    const indexBundle = output[0].code;
    let varDefinedAfterBundle;
    eval(`${indexBundle}; varDefinedAfterBundle = 'foo';`);
    expect(varDefinedAfterBundle).toEqual('foo');
  });
});
