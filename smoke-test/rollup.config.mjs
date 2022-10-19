import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  output: {
    inlineDynamicImports: true,
  },
  plugins: [nodeResolve({ preferBuiltins: true }), commonjs(), json()],
};
