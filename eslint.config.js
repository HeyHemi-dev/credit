//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'
import tseslint from 'typescript-eslint'

// Extract plugins from tanstack config to reuse in our custom config
const configWithPlugins = tanstackConfig.find(
  (config) => config.plugins && config.plugins['@typescript-eslint'],
)

export default [
  {
    ignores: [
      '.output/**',
      '.nitro/**',
      'dist/**',
      'build/**',
      'node_modules/**',
      '*.config.js',
      '*.config.ts',
      'routeTree.gen.ts',
    ],
  },
  ...tanstackConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: configWithPlugins?.plugins || {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'typeParameter',
          format: ['PascalCase', 'UPPER_CASE'],
          // Allow single-letter type parameters like E, T, U (common convention)
          filter: {
            regex: '^[A-Z]$',
            match: true,
          },
        },
      ],
      // Disable unnecessary condition check - shadcn components use defensive optional chaining
      '@typescript-eslint/no-unnecessary-condition': 'off',
      // Disable no-shadow - shadcn components use shadowed variables in destructuring
      'no-shadow': 'off',
    },
  },
]
