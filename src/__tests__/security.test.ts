import { describe, it, expect } from 'vitest'
import { sanitizeInput, isAllowedValue } from '../lib/sanitize'
import { checkRateLimit } from '../lib/rateLimit'

describe('sanitizeInput', () => {
  it('returns null for non-string', () => {
    expect(sanitizeInput(123)).toBeNull()
  })
  it('returns null for empty string', () => {
    expect(sanitizeInput('')).toBeNull()
  })
  it('returns null when over maxLength', () => {
    expect(sanitizeInput('a'.repeat(2001))).toBeNull()
  })
  it('strips HTML tags', () => {
    expect(sanitizeInput('<script>alert(1)</script>test'))
      .toBe('alert(1)test')
  })
  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello')
  })
  it('returns valid string', () => {
    expect(sanitizeInput('hello world')).toBe('hello world')
  })
})

describe('isAllowedValue', () => {
  it('returns true for allowed value', () => {
    expect(isAllowedValue('Medical Emergency', 
      ['Medical Emergency', 'Security Threat'])).toBe(true)
  })
  it('returns false for non-allowed value', () => {
    expect(isAllowedValue('Hack Attempt', 
      ['Medical Emergency'])).toBe(false)
  })
  it('returns false for non-string', () => {
    expect(isAllowedValue(123, ['123'])).toBe(false)
  })
})

describe('checkRateLimit', () => {
  it('allows requests under limit', () => {
    expect(checkRateLimit('test-ip-1', 5)).toBe(true)
  })
  it('blocks after limit exceeded', () => {
    const ip = 'test-ip-block-' + Date.now()
    for (let i = 0; i < 5; i++) checkRateLimit(ip, 5)
    expect(checkRateLimit(ip, 5)).toBe(false)
  })
})
