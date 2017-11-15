module.exports = {
  parser: `babel-eslint`,
  plugins: [`prettier`, `react`],
  env: {
    browser: true,
    es6: true,
    node: false
  },
  extends: [`eslint:recommended`, `plugin:react/recommended`]
};
