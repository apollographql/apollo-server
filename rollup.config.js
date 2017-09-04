import path from 'path';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const pkgName = path.basename(process.cwd());
const pkg = require(path.resolve(process.cwd(), 'package.json'));
const entry = pkg.module || pkg.main;

let dependencies = ['crypto'].concat(Object.keys(pkg.peerDependencies || {}));

// if this is graphql- forwarding package, treat as external due to real
// dependencies (graphql) not being specific in package.json
if (pkgName.substr(0, 8) === 'graphql-') {
  dependencies = dependencies.concat(Object.keys(pkg.dependencies || {}));
}

// apollo-server-integration-testsuite doesn't have dependencies listed
if (pkgName === 'apollo-server-integration-testsuite') {
  dependencies = dependencies.concat(['chai', 'sinon', 'mocha']);
}

// console.log('DEBUG', pkgName, dependencies);

// rollup.config.js
export default {
  input: entry,
  external: dependencies,
  plugins: [
    nodeResolve({
      module: true,
      jsnext: true
    }),
    commonjs({
      include: /node_modules/
    })
  ],
  output: [
    {
      file: `dist/build/${pkgName}.cjs.js`,
      format: 'cjs'
    },
    {
      file: `dist/build/${pkgName}.es.js`,
      format: 'es'
    }
  ]
};