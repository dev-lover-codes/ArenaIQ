import { describe, it, expect, vi } from 'vitest'
import { env } from '@/lib/env'

describe('Environment Variable Utility', () => {
  it('correctly returns SUPABASE_URL and SUPABASE_ANON_KEY if defined', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://defined-test-url.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'defined-anon-key')

    expect(env.SUPABASE_URL()).toBe('https://defined-test-url.co')
    expect(env.SUPABASE_ANON_KEY()).toBe('defined-anon-key')

    vi.unstubAllEnvs()
  })

  it('throws an error if a required environment variable is missing', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    expect(() => env.SUPABASE_URL()).toThrow('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL')
    
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
    expect(() => env.SUPABASE_ANON_KEY()).toThrow('Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')

    vi.unstubAllEnvs()
  })

  it('correctly handles GEMINI_API_KEY as optional', () => {
    vi.stubEnv('GEMINI_API_KEY', 'optional-gemini-key')
    expect(env.GEMINI_API_KEY()).toBe('optional-gemini-key')

    vi.stubEnv('GEMINI_API_KEY', '')
    expect(env.GEMINI_API_KEY()).toBe('')

    vi.unstubAllEnvs()
  })
})
