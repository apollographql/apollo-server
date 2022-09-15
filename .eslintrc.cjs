module.exports = {
  root: true,
  ignorePatterns: ['**/*.js'],
  overrides: [
    {
      extends: ['plugin:import/typescript'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'import'],
      // Enable import/extensions on all TS files because our ESM builds require
      // you to specify local imports as full paths with extensions. We don't
      // need this on tests because Jest doesn't require it.
      files: ['**/*.ts'],
      excludedFiles: '**/__tests__/**/*.ts',
      rules: { 'import/extensions': ['error', 'ignorePackages'] },
    },
    {
      extends: ['plugin:mdx/recommended', 'plugin:prettier/recommended'],
      files: ['**/*.md?(x)'],
    },
  ],
};
