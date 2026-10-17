import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  { ignores: ['**/node_modules/**', '**/.next/**', 'apps/mobile/android/**', 'apps/mobile/ios/**', '**/next-env.d.ts'] },
  { files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.mjs'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    rules: { 'no-eval': 'error', 'no-new-func': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }] } },
  // REST and raw report collectors narrow external JSON at the authenticated boundary.
  { files: ['tools/ci/**/*.ts'], rules: { '@typescript-eslint/no-explicit-any': 'off' } },
  { files: ['apps/mobile/metro.config.js'],languageOptions: { sourceType:'commonjs',globals:{ __dirname:'readonly' } },
    rules: { '@typescript-eslint/no-require-imports':'off' } },
]);
