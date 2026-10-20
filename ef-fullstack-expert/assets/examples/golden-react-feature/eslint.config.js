import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

/**
 * Typed linting needs the TypeScript *API*. TypeScript 7.0 (native, Go) ships no programmatic API,
 * so package.json aliases `typescript` to @typescript/typescript6 (API for tools) and installs the
 * 7.0 compiler as `@typescript/native` (the `tsc` binary). Re-check when TypeScript 7.1 ships its API.
 */
export default tseslint.config(
  { ignores: ['node_modules', 'dist', 'playwright-report', 'test-results', '.dependency-cruiser.cjs'] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  reactHooks.configs.flat.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ['eslint.config.js', 'scripts/*.mjs'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
      '@typescript-eslint/consistent-type-imports': 'error',
      // Module boundaries are enforced by dependency-cruiser on resolved paths (npm run boundaries).
    },
  },
  { files: ['**/*.js', '**/*.mjs'], ...tseslint.configs.disableTypeChecked },
  { files: ['scripts/**'], languageOptions: { globals: { process: 'readonly', console: 'readonly' } } },
  {
    files: ['tests/**', 'e2e/**', '*.config.ts', 'eslint.config.js'],
    rules: { '@typescript-eslint/unbound-method': 'off' },
  },
);
