/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    'next/core-web-vitals',
    'next/typescript',
  ],
  rules: {
    // Error on any types
    '@typescript-eslint/no-explicit-any': 'error',
    // Error on unused vars (allow _ prefix pattern)
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'complexity': ['warn', 15],
    'max-lines-per-function': ['warn', { max: 80, skipComments: true, skipBlankLines: true }],
    'max-depth': ['warn', 4],
  },
  overrides: [
    {
      // Test type declaration files use empty interfaces intentionally (to merge types)
      files: ['src/__tests__/*.d.ts'],
      rules: {
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: ['src/__tests__/**/*.{ts,tsx}'],
      rules: {
        'max-lines-per-function': 'off',
      },
    },
  ],
}
