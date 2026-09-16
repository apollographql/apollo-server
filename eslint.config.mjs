import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

// We have enabled specific lint rules on this repo rather than enabling sets of
// recommended rules. (We may want to enable recommended rules later, though
// many of them might fail for now.)

export default tseslint.config(
  // Files to completely ignore.
  {
    ignores: [
      '**/dist/**',
      '**/generated/**',
      '**/coverage/**',
      'smoke-test/**',
    ],
  },
  // Rules to apply to all TypeScript files.
  {
    files: ['**/*.ts'],
    extends: [
      // Enable typescript-eslint (without any enabled rules).
      tseslint.configs.base,
      // Enable eslint-plugin-import's typescript configuration (without any
      // enabled rules). We should be able to just write
      // `importPlugin.flatConfigs.typescript` but there's a bug in the
      // currently released version of the plugin (fix PR merged but unreleased)
      // that doesn't actually enable the plugin when you use it, so this is a workaround.
      // https://github.com/import-js/eslint-plugin-import/pull/3151#issuecomment-2902570482
      {
        ...importPlugin.flatConfigs.typescript,
        name: `import/typescript`,
        plugins: importPlugin.flatConfigs.recommended.plugins,
      },
    ],
    rules: {
      // Make sure we always use `import type` when we can get away with it.
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
    },
  },
  // Rules that do not apply to test code.
  {
    files: ['**/*.ts'],
    ignores: ['**/__tests__/**/*.ts'],
    rules: {
      // Enable import/extensions on all TS files because our ESM builds require
      // you to specify local imports as full paths with extensions. We don't
      // need this on tests because Jest doesn't require it.
      'import/extensions': ['error', 'ignorePackages'],
      // Disallow importing a node module without it being specified in
      // package.json. We don't enable this for tests because we regularly
      // import packages from the top-level package.json in our tests, and
      // there's not an easy way in the configuration to say "look at the
      // auto-detected closest package.json to the file AND this other specific
      // one".

      // https://github.com/import-js/eslint-plugin-import/issues/1913
      'import/no-extraneous-dependencies': 'error',
    },
  },
);
