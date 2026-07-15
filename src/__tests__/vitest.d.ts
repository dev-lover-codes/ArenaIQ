/// <reference types="@testing-library/jest-dom" />
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

// Augment Vitest's Assertion interface with @testing-library/jest-dom matchers.
// This allows toBeInTheDocument(), toHaveClass(), toBeDisabled(), etc. in tests.
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type CustomMatchers<R = any> = TestingLibraryMatchers<R, void>

  interface Assertion<R = unknown> extends CustomMatchers<R> {} // eslint-disable-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends CustomMatchers {} // eslint-disable-line @typescript-eslint/no-empty-object-type
}
