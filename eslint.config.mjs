import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([
    '.next/**',
    '.codex/**',
    '.agents/**',
    'dist/**',
    'out/**',
    'coverage/**',
    'node_modules/**',
  ]),
  {
    files: ['src/components/scene/**/*.tsx'],
    rules: {
      'react-hooks/immutability': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]);
