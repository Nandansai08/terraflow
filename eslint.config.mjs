import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      'node_modules/',
      '**/dist/',
      '**/.next/',
      'apps/web/public/',
      'packages/database/generated/',
      'apps/web/copy-cesium-assets.js',
      '**/next-env.d.ts',
    ],
  },
];
