/**
 * matches.test.ts — tests for match_insight action in /api/gemini
 */
import { expect, test, describe, vi, beforeEach } from 'vitest'
import { POST as geminiPOST } from '../app/api/gemini/route'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('next/headers', () => ({
  cookies: async () => ({ getAll: () => [], set: () => {} })
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn().mockImplementation(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'u1', email: 'test@arena.iq' } },
        error: null
      })
    },
    from: vi.fn().mockImplementation(() => ({
      then: (fn: (r: { data: unknown; error: null }) => unknown) =>
        Promise.resolve({ data: [], error: null }).then(fn),
      eq: function () { return this },
      single: () => Promise.resolve({ data: null, error: null }),
      select: function () { return this },
      insert: function () { return this },
      update: function () { return this },
    }))
  }))
}))

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        generateContent: async () => ({
          response: { text: () => 'Mocked tactical insight for the match.' }
        }),
        startChat: () => ({
          sendMessage: async () => ({
            response: { text: () => 'Mocked chat reply.' }
          })
        })
      }
    }
  }
}))

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key'
  process.env.GEMINI_API_KEY = 'real-gemini-key'
})

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeReq = (body: object) =>
  new Request('http://localhost/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/gemini — match_insight action', () => {
  test('returns { success: true } with insight text on valid request', async () => {
    const res = await geminiPOST(makeReq({
      action: 'match_insight',
      homeTeam: 'Brazil',
      awayTeam: 'Argentina'
    }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(typeof data.text).toBe('string')
    expect(data.text.length).toBeGreaterThan(0)
  })

  test('returns 400 when homeTeam is missing', async () => {
    const res = await geminiPOST(makeReq({
      action: 'match_insight',
      awayTeam: 'Germany'
    }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('homeTeam')
  })

  test('returns 400 when awayTeam is missing', async () => {
    const res = await geminiPOST(makeReq({
      action: 'match_insight',
      homeTeam: 'France'
    }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('awayTeam')
  })

  test('returns 400 when both homeTeam and awayTeam are missing', async () => {
    const res = await geminiPOST(makeReq({
      action: 'match_insight'
    }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.success).toBe(false)
  })

  test('accepts language parameter and returns { success: true }', async () => {
    const res = await geminiPOST(makeReq({
      action: 'match_insight',
      homeTeam: 'Spain',
      awayTeam: 'Portugal',
      language: 'es'
    }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  test('homeTeam cannot be an empty string', async () => {
    const res = await geminiPOST(makeReq({
      action: 'match_insight',
      homeTeam: '',
      awayTeam: 'Italy'
    }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.success).toBe(false)
  })

  test('awayTeam cannot be an empty string', async () => {
    const res = await geminiPOST(makeReq({
      action: 'match_insight',
      homeTeam: 'Netherlands',
      awayTeam: ''
    }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.success).toBe(false)
  })

  test('success response has success property equal to true', async () => {
    const res = await geminiPOST(makeReq({
      action: 'match_insight',
      homeTeam: 'England',
      awayTeam: 'USA'
    }))
    const data = await res.json()
    expect(data).toHaveProperty('success', true)
  })
})
