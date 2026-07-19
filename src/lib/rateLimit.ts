const requestCounts = new Map<string, { count: number; resetAt: number }>()

// Periodic cleanup counter — avoids unbounded Map growth in long-running processes.
// We use an invocation-count sweep rather than setInterval, because serverless functions
// don't guarantee background timer execution between invocations.
let callCount = 0

/**
 * Simple in-memory rate limiter.
 * @param identifier - IP address or user ID
 * @param limit - Max requests per window (default 20)
 * @param windowMs - Time window in ms (default 60000 = 1 minute)
 * @returns True if request is allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  limit = 20,
  windowMs = 60_000
): boolean {
  // Sweep expired entries every ~50 calls to prevent unbounded Map growth.
  callCount++
  if (callCount % 50 === 0) {
    const sweepNow = Date.now()
    for (const [key, entry] of requestCounts) {
      if (sweepNow > entry.resetAt) requestCounts.delete(key)
    }
  }

  const now = Date.now()
  const entry = requestCounts.get(identifier)
  
  if (!entry || now > entry.resetAt) {
    requestCounts.set(identifier, { count: 1, resetAt: now + windowMs })
    return true
  }
  
  if (entry.count >= limit) return false
  entry.count++
  return true
}
