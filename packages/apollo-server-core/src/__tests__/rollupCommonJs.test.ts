const rollup = require('rollup');
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';

describe('@rollup/plugin-commonjs', () => {
  it('bundles into es6 without circular dependencies issues', async () => {
    const outputOptions = {
      exports: 'named',
      name: 'apollo',
      format: 'umd',
      sourcemapExcludeSources: false,
    };
    const bundle = await rollup.rollup({
      input: path.resolve(__dirname, '..', '..', 'dist', 'index.js'),
      plugins: [json(), commonjs()],
      onwarn: () => {
        /* suppress warnings */
      },
    });
    const { output } = await bundle.generate(outputOptions);
    const indexBundle = output[0].code;
    var varDefinedAfterBundle;
    eval(`${indexBundle}; varDefinedAfterBundle = 'foo';`);
    expect(varDefinedAfterBundle).toEqual('foo');
  });
});
