import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

/**
 * Creates a browser-side Supabase client using validated environment variables.
 * Used exclusively in client-side React components and custom hooks.
 * 
 * @returns An initialized SupabaseClient instance.
 */
export function createClient(): SupabaseClient {
  return createBrowserClient(
    env.SUPABASE_URL(),
    env.SUPABASE_ANON_KEY()
  )
}
