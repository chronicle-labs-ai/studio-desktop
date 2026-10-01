import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import hooks from 'eslint-plugin-react-hooks';
import refresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

// The previous CLI selected only .ts/.tsx; eslintrc also ignored dot paths and
// directories named dist at every depth. Keep those boundaries in flat config.
const files = ['**/*.{ts,tsx}'];

export default [
  { ignores: ['**/.*', '**/dist/**'] },
  { ...js.configs.recommended, files },
  ...ts.configs['flat/recommended'].map((config) => ({ ...config, files })),
  {
    files,
    languageOptions: {
      parser,
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2020 },
    },
    plugins: { 'react-hooks': hooks, 'react-refresh': refresh },
    rules: {
      // Retain the two original Hooks checks and their severities. Adopting the
      // separate React Compiler rule set is outside this tooling migration.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // New recommended presets omit these existing checks or relax defaults.
      'no-class-assign': 'error',
      'no-with': 'error',
      'no-extra-semi': 'error',
      'no-mixed-spaces-and-tabs': 'error',
      'no-inner-declarations': ['error', 'functions', { blockScopedFunctions: 'disallow' }],
      'no-constant-condition': ['error', { checkLoops: 'all' }],

      // TS ESLint removed its precision rule in favor of the equivalent core
      // check. no-require-imports replaces no-var-requires in its new preset.
      'no-loss-of-precision': 'error',

      // ban-types was removed in TS ESLint 8. Its default ban also covered empty
      // intersections and locally shadowed wrapper names; preserve that scope
      // alongside the newer, more targeted recommended type checks.
      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            String: { message: 'Use string instead', fixWith: 'string' },
            Boolean: { message: 'Use boolean instead', fixWith: 'boolean' },
            Number: { message: 'Use number instead', fixWith: 'number' },
            Symbol: { message: 'Use symbol instead', fixWith: 'symbol' },
            BigInt: { message: 'Use bigint instead', fixWith: 'bigint' },
            Function: 'Use an explicit function signature instead.',
            Object: 'Use object, unknown, or NonNullable<unknown> instead.',
            '{}': 'Use object, unknown, Record<string, never>, or NonNullable<unknown> instead.',
          },
        },
      ],
    },
  },
];
