/**
 * Validates and retrieves a required environment variable.
 * @param key - The name of the environment variable.
 * @throws {Error} Throws if the environment variable is not defined.
 * @returns The string value of the environment variable.
 */
function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

/**
 * Validated configuration container for application environment variables.
 */
export const env = {
  SUPABASE_URL: () => requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: () => requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  GEMINI_API_KEY: () => process.env.GEMINI_API_KEY, // optional, has mock fallback
}
