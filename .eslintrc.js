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
  ],
}
