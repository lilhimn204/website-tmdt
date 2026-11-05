import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['node_modules/**', 'build/**', '.react-router/**', '.wrangler/**', 'artifacts/**', 'coverage/**']),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['*.js', '*.ts', 'scripts/**/*.mjs', 'tests/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['tests/**/*.tsx', 'tests/ui-setup.ts', 'scripts/check-navigation.mjs', 'scripts/check-home.mjs'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['error', {
        allowConstantExport: true,
        allowExportNames: ['meta', 'links', 'clientLoader', 'HydrateFallback', 'ErrorBoundary', 'Layout'],
      }],
      'no-restricted-imports': ['error', {
        patterns: [{ group: ['**/server/**', '**/functions/**', 'node:*', '@cloudflare/workers-types'], message: 'Frontend must not import server/runtime modules.' }],
      }],
    },
  },
  {
    files: ['functions/**/*.ts', 'server/**/*.ts'],
    languageOptions: { globals: globals.worker },
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{ group: ['node:*'], message: 'Use Cloudflare Web APIs in Pages Functions.' }],
      }],
    },
  },
]);
