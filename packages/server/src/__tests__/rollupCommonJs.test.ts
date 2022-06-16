const rollup = require('rollup');
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';

describe('@rollup/plugin-commonjs', () => {
  it('bundles into es6 without circular dependencies issues', async () => {
    const outputOptions = {
      exports: 'named',
      name: 'apollo',
      format: 'umd',
    };
    const bundle = await rollup.rollup({
      input: path.resolve(__dirname, '..', '..', 'dist', 'cjs', 'index.js'),
      plugins: [commonjs()],
      onwarn: () => {
        /* suppress warnings */
      },
    });
    const { output } = await bundle.generate(outputOptions);
    await bundle.close();
    const indexBundle = output[0].code;
    var varDefinedAfterBundle;
    eval(`${indexBundle}; varDefinedAfterBundle = 'foo';`);
    expect(varDefinedAfterBundle).toEqual('foo');
  });
});
