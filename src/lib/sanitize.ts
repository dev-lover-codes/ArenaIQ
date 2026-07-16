/**
 * Strips HTML tags and trims input to prevent XSS injection.
 * @param input - Raw string input from user
 * @param maxLength - Maximum allowed length (default 2000)
 * @returns Sanitized string or null if invalid
 */
export function sanitizeInput(
  input: unknown, 
  maxLength = 2000
): string | null {
  if (typeof input !== 'string') return null
  const trimmed = input.trim()
  if (trimmed.length === 0 || trimmed.length > maxLength) return null
  // Strip HTML tags
  return trimmed.replace(/<[^>]*>/g, '').replace(/[<>]/g, '')
}

/**
 * Validates that a string is one of the allowed enum values.
 * @param value - Value to check
 * @param allowed - Array of allowed string values
 * @returns True if value is in the allowed list
 */
export function isAllowedValue(
  value: unknown, 
  allowed: string[]
): value is string {
  return typeof value === 'string' && allowed.includes(value)
}
