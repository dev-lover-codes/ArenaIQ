import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

/**
 * Creates a server-side Supabase client using validated environment variables.
 * Handles reading and writing session cookies securely from/to Next.js request headers.
 * 
 * @returns A Promise resolving to an initialized SupabaseClient instance.
 */
export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies()

  return createServerClient(
    env.SUPABASE_URL(),
    env.SUPABASE_ANON_KEY(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method can be called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
