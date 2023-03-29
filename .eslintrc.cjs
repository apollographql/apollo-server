module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: ['plugin:import/typescript'],
  overrides: [
    {
      // Enable import/extensions on all TS files because our ESM builds require
      // you to specify local imports as full paths with extensions. We don't
      // need this on tests because Jest doesn't require it.
      files: ['**/*.ts'],
      excludedFiles: '**/__tests__/**/*.ts',
      rules: {
        'import/extensions': ['error', 'ignorePackages'],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          {
            prefer: 'type-imports',
            fixStyle: 'inline-type-imports',
          },
        ],
      },
    },
  ],
};
