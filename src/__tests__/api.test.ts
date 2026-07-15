/**
 * api.test.ts — targeted API validation tests (mocked Supabase + fetch)
 */
import { expect, test, describe, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as geminiPOST } from '../app/api/gemini/route'
import { POST as navigatePOST } from '../app/api/navigate/route'
import { POST as chatPOST } from '../app/api/chat/route'
import { GET as simulateGET } from '../app/api/simulate-crowd/route'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('next/headers', () => ({
  cookies: async () => ({ getAll: () => [], set: () => {} })
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn().mockImplementation(() => {
    const makeBuilder = (dataValue: unknown) => ({
      then: (fn: (r: { data: unknown; error: null }) => unknown) =>
        Promise.resolve({ data: dataValue, error: null }).then(fn),
      eq: function() { return makeBuilder(dataValue) },
      single: () => Promise.resolve({ data: dataValue, error: null }),
      select: function() { return makeBuilder(dataValue) },
      insert: function() { return makeBuilder({ id: 'new-id' }) },
      update: function() { return makeBuilder(dataValue) },
      order: function() { return makeBuilder(dataValue) },
    })
    return {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'u1', email: 'test@arena.iq' } },
          error: null
        })
      },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'zones') {
          return makeBuilder([
            { id: 'z1', name: 'Gate A', status: 'open', capacity: 1000, current_occupancy: 100, has_elevator: true },
            { id: 'z2', name: 'Section 100', status: 'open', capacity: 1000, current_occupancy: 200, has_elevator: false },
          ])
        }
        if (table === 'zone_edges') {
          return makeBuilder([
            { zone_a_id: 'z1', zone_b_id: 'z2', walk_time_seconds: 30, is_step_free: true }
          ])
        }
        if (table === 'crowd_events') return makeBuilder([])
        if (table === 'chat_sessions') {
          return makeBuilder({ id: 'sess-1', messages: [{ role: 'user', parts: [{ text: 'hi' }] }] })
        }
        return makeBuilder([])
      })
    }
  })
}))

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        generateContent: async () => ({ response: { text: () => '{}' } }),
        startChat: () => ({ sendMessage: async () => ({ response: { text: () => 'AI reply' } }) })
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

  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ success: true, text: '{}' })
  }) as unknown as typeof global.fetch
})

// ─── /api/gemini ─────────────────────────────────────────────────────────────

describe('POST /api/gemini', () => {
  const makeReq = (body: object) =>
    new Request('http://localhost/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

  test('returns 400 when prompt is missing', async () => {
    const res = await geminiPOST(makeReq({ model: 'gemini-1.5-flash' }))
    expect(res.status).toBe(400)
    const d = await res.json()
    expect(d.success).toBe(false)
    expect(d.error).toContain('Prompt is required')
  })

  test('returns 400 when prompt exceeds 2000 chars', async () => {
    const res = await geminiPOST(makeReq({ prompt: 'x'.repeat(2001), model: 'gemini-1.5-flash' }))
    expect(res.status).toBe(400)
    const d = await res.json()
    expect(d.success).toBe(false)
    expect(d.error).toContain('2000 chars')
  })

  test('returns 400 when model is missing', async () => {
    const res = await geminiPOST(makeReq({ prompt: 'Hello?' }))
    expect(res.status).toBe(400)
    const d = await res.json()
    expect(d.success).toBe(false)
    expect(d.error).toContain('Model is required')
  })

  test('returns 200 on valid prompt + model', async () => {
    const res = await geminiPOST(makeReq({ prompt: 'Where is Gate A?', model: 'gemini-1.5-flash' }))
    expect(res.status).toBe(200)
    const d = await res.json()
    expect(d.success).toBe(true)
  })
})

// ─── /api/navigate ────────────────────────────────────────────────────────────

describe('POST /api/navigate', () => {
  const makeReq = (body: object) =>
    new Request('http://localhost/api/navigate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

  test('returns 400 when startZone is missing', async () => {
    const res = await navigatePOST(makeReq({ endZone: 'z2' }))
    expect(res.status).toBe(400)
    const d = await res.json()
    expect(d.success).toBe(false)
    expect(d.error).toContain('Start and destination zones are required')
  })

  test('returns 400 when endZone is missing', async () => {
    const res = await navigatePOST(makeReq({ startZone: 'z1' }))
    expect(res.status).toBe(400)
    const d = await res.json()
    expect(d.success).toBe(false)
    expect(d.error).toContain('Start and destination zones are required')
  })

  test('returns 400 when both zones are missing', async () => {
    const res = await navigatePOST(makeReq({ language: 'en' }))
    expect(res.status).toBe(400)
    const d = await res.json()
    expect(d.success).toBe(false)
  })

  test('returns 200 with path on valid zones', async () => {
    const res = await navigatePOST(makeReq({ startZone: 'z1', endZone: 'z2', language: 'en' }))
    expect(res.status).toBe(200)
    const d = await res.json()
    expect(d.success).toBe(true)
    expect(Array.isArray(d.path)).toBe(true)
  })

  test('accepts wheelchairMode flag without errors', async () => {
    const res = await navigatePOST(makeReq({ startZone: 'z1', endZone: 'z2', wheelchairMode: true }))
    expect(res.status).toBe(200)
    const d = await res.json()
    expect(d.success).toBe(true)
  })
})

// ─── /api/chat ────────────────────────────────────────────────────────────────

describe('POST /api/chat', () => {
  const makeReq = (body: object) =>
    new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

  test('returns 400 when message is empty string', async () => {
    const res = await chatPOST(makeReq({ message: '', sessionId: 'sess-1' }))
    expect(res.status).toBe(400)
    const d = await res.json()
    expect(d.success).toBe(false)
    expect(d.error).toContain('Message is required')
  })

  test('returns 400 when message is missing entirely', async () => {
    const res = await chatPOST(makeReq({ sessionId: 'sess-1' }))
    expect(res.status).toBe(400)
    const d = await res.json()
    expect(d.success).toBe(false)
  })

  test('returns 200 on valid message with sessionId', async () => {
    const res = await chatPOST(makeReq({ message: 'Where is Gate A?', sessionId: 'sess-1' }))
    expect(res.status).toBe(200)
    const d = await res.json()
    expect(d.success).toBe(true)
  })
})

// ─── /api/simulate-crowd ──────────────────────────────────────────────────────

describe('GET /api/simulate-crowd', () => {
  test('returns { success: true } with zones_updated count', async () => {
    const res = await simulateGET(new NextRequest('http://localhost/api/simulate-crowd'))
    expect(res.status).toBe(200)
    const d = await res.json()
    expect(d.success).toBe(true)
    expect(typeof d.zones_updated).toBe('number')
  })
})
