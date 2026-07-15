/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    'next/core-web-vitals',
    'next/typescript',
  ],
  rules: {
    // Warn on any types but don't error — explicit-any suppressions allowed
    '@typescript-eslint/no-explicit-any': 'warn',
    // Allow unused vars prefixed with _ (e.g. _unused)
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },
}
