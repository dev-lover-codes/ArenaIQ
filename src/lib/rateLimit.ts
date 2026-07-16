const requestCounts = new Map<string, { count: number; resetAt: number }>()

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
