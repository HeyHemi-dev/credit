//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
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
    },
  },
]
