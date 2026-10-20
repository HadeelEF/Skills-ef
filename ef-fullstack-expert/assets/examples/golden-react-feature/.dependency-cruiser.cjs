/**
 * Module boundaries on *resolved* paths (relative-path lint patterns cannot tell an internal
 * "../api" from a sibling feature's "../other/api"). Runs in CI with `npm run boundaries`.
 */
module.exports = {
  forbidden: [
    {
      name: 'no-cross-feature-internals',
      comment: 'A feature may use another feature only through its public index.ts.',
      severity: 'error',
      from: { path: '^src/features/([^/]+)/' },
      to: { path: '^src/features/([^/]+)/', pathNot: ['^src/features/$1/', '^src/features/[^/]+/index\\.ts$'] },
    },
    {
      name: 'shared-is-leaf',
      comment: 'shared/ is generic: it must not know features or the app shell.',
      severity: 'error',
      from: { path: '^src/shared/' },
      to: { path: '^src/(features|app)/' },
    },
    {
      name: 'features-do-not-import-app',
      severity: 'error',
      from: { path: '^src/features/' },
      to: { path: '^src/app/' },
    },
    { name: 'no-circular', severity: 'error', from: {}, to: { circular: true } },
    {
      name: 'no-test-code-in-src',
      severity: 'error',
      from: { path: '^src/' },
      to: { path: '^(tests|e2e)/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: { extensions: ['.ts', '.tsx', '.js'] },
  },
};
