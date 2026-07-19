import { describe, it, expect } from 'vitest'
import { sanitizeInput, isAllowedValue } from '../lib/sanitize'

// These tests cover edge-cases not in security.test.ts:
// nested/malformed tags, whitespace-only input, empty-after-trim,
// custom maxLength, and case-sensitivity of isAllowedValue.

describe('sanitizeInput — extended edge cases', () => {
  it('strips nested / malformed tags like <scr<script>ipt>', () => {
    // The inner <script> tag is removed by the regex, leaving "scr" + "ipt" as plain text
    const result = sanitizeInput('<scr<script>ipt>alert(1)</script>')
    // Must not contain any < or > characters
    expect(result).not.toMatch(/[<>]/)
    // Malicious payload should be neutralised
    expect(result).not.toContain('<script>')
  })

  it('strips self-closing and attribute-bearing tags', () => {
    const result = sanitizeInput('<img src="x" onerror="alert(1)"/>')
    expect(result).not.toMatch(/[<>]/)
    expect(result).not.toContain('onerror')
  })

  it('strips angle brackets left after regex (bare < or >)', () => {
    // A lone < not part of a complete tag should also be removed
    const result = sanitizeInput('price < 100 and value > 50')
    expect(result).not.toMatch(/[<>]/)
  })

  it('returns null for whitespace-only input', () => {
    expect(sanitizeInput('   ')).toBeNull()
    expect(sanitizeInput('\t\n')).toBeNull()
  })

  it('returns null for empty string after trimming', () => {
    // A string that is purely whitespace trims to "", which has length 0
    expect(sanitizeInput('  \t  ')).toBeNull()
  })

  it('returns null when input exceeds a custom maxLength', () => {
    // Default is 2000; here we pass a tight custom limit
    expect(sanitizeInput('hello world', 5)).toBeNull()
  })

  it('accepts input exactly at custom maxLength boundary', () => {
    expect(sanitizeInput('hello', 5)).toBe('hello')
  })

  it('returns null when input is one character over custom maxLength', () => {
    expect(sanitizeInput('hello!', 5)).toBeNull()
  })

  it('returns null for null input', () => {
    expect(sanitizeInput(null)).toBeNull()
  })

  it('returns null for object input', () => {
    expect(sanitizeInput({ toString: () => 'hi' })).toBeNull()
  })

  it('returns null for array input', () => {
    expect(sanitizeInput(['hello'])).toBeNull()
  })

  it('preserves valid text after stripping tags', () => {
    expect(sanitizeInput('<b>Bold</b> text')).toBe('Bold text')
  })
})

describe('isAllowedValue — extended edge cases', () => {
  const ALLOWED = ['Medical Emergency', 'Security Threat', 'Fire', 'Crowd Crush']

  it('is case-sensitive — uppercase fails', () => {
    expect(isAllowedValue('MEDICAL EMERGENCY', ALLOWED)).toBe(false)
  })

  it('is case-sensitive — lowercase fails', () => {
    expect(isAllowedValue('medical emergency', ALLOWED)).toBe(false)
  })

  it('is case-sensitive — mixed case fails', () => {
    expect(isAllowedValue('Medical emergency', ALLOWED)).toBe(false)
  })

  it('rejects a near-match with a trailing space', () => {
    expect(isAllowedValue('Fire ', ALLOWED)).toBe(false)
  })

  it('rejects a near-match with a leading space', () => {
    expect(isAllowedValue(' Fire', ALLOWED)).toBe(false)
  })

  it('rejects a partial substring match', () => {
    expect(isAllowedValue('Fire', ['Campfire'])).toBe(false)
  })

  it('returns true for an exact match', () => {
    expect(isAllowedValue('Crowd Crush', ALLOWED)).toBe(true)
  })

  it('returns false for an empty string not in allowed list', () => {
    expect(isAllowedValue('', ALLOWED)).toBe(false)
  })

  it('returns true for an empty string when allowed list contains empty string', () => {
    expect(isAllowedValue('', [''])).toBe(true)
  })

  it('returns false for undefined', () => {
    expect(isAllowedValue(undefined, ALLOWED)).toBe(false)
  })

  it('returns false for a number that coerces to an allowed string', () => {
    // e.g. allowed = ['5'], input = 5 (number) — must fail because typeof !== 'string'
    expect(isAllowedValue(5, ['5'])).toBe(false)
  })
})
