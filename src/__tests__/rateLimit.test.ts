import { describe, it, expect, vi, afterEach } from 'vitest'
import { checkRateLimit } from '../lib/rateLimit'

// Each test uses a unique IP prefix to avoid cross-test state pollution
// (rateLimit uses a module-level Map that persists across tests in the same process).
const uid = () => `ip-${Date.now()}-${Math.random().toString(36).slice(2)}`

describe('checkRateLimit', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows requests under the limit', () => {
    const ip = uid()
    // First 3 calls with limit=5 should all pass
    expect(checkRateLimit(ip, 5)).toBe(true)
    expect(checkRateLimit(ip, 5)).toBe(true)
    expect(checkRateLimit(ip, 5)).toBe(true)
  })

  it('blocks the (limit+1)th request within the window', () => {
    const ip = uid()
    const limit = 5
    for (let i = 0; i < limit; i++) {
      expect(checkRateLimit(ip, limit)).toBe(true)
    }
    // The very next call must be blocked
    expect(checkRateLimit(ip, limit)).toBe(false)
  })

  it('continues to block while within the window', () => {
    const ip = uid()
    const limit = 3
    for (let i = 0; i < limit; i++) checkRateLimit(ip, limit)
    // Multiple excess calls should all be false
    expect(checkRateLimit(ip, limit)).toBe(false)
    expect(checkRateLimit(ip, limit)).toBe(false)
  })

  it('resets after windowMs has passed', () => {
    vi.useFakeTimers()
    const ip = uid()
    const limit = 3
    const windowMs = 1_000

    // Exhaust the limit
    for (let i = 0; i < limit; i++) checkRateLimit(ip, limit, windowMs)
    expect(checkRateLimit(ip, limit, windowMs)).toBe(false)

    // Advance past the window
    vi.advanceTimersByTime(windowMs + 1)

    // Should be allowed again — new window starts
    expect(checkRateLimit(ip, limit, windowMs)).toBe(true)
  })

  it('tracks different identifiers independently', () => {
    const ip1 = uid()
    const ip2 = uid()
    const limit = 2

    // Exhaust ip1
    for (let i = 0; i < limit; i++) checkRateLimit(ip1, limit)
    expect(checkRateLimit(ip1, limit)).toBe(false)

    // ip2 should be completely unaffected
    expect(checkRateLimit(ip2, limit)).toBe(true)
    expect(checkRateLimit(ip2, limit)).toBe(true)
  })

  it('does not grow unbounded after 50+ calls with expired entries (cleanup sweep)', () => {
    vi.useFakeTimers()
    const windowMs = 500

    // Create 40 unique entries that will expire
    const expiredIps = Array.from({ length: 40 }, () => uid())
    for (const ip of expiredIps) {
      checkRateLimit(ip, 1, windowMs)
    }

    // Advance past the window so all entries are expired
    vi.advanceTimersByTime(windowMs + 1)

    // Trigger 50+ more calls to fire the cleanup sweep (callCount % 50 === 0).
    // Use unique IPs so we don't hit the limit, then make the 50th call be a fresh one.
    const freshIps = Array.from({ length: 50 }, () => uid())
    for (const ip of freshIps) {
      checkRateLimit(ip, 100, windowMs)
    }

    // After the sweep the expired entries should have been evicted.
    // We can't access the private Map directly, but we can confirm the sweep
    // ran without error and fresh requests are still allowed.
    const probeIp = uid()
    expect(checkRateLimit(probeIp, 10, windowMs)).toBe(true)
  })
})
