/**
 * incidents.test.ts — tests for incident_response action in /api/gemini
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
          response: {
            text: () => '1. Alert security. 2. Cordon zone. 3. Notify medical. 4. Evacuate fans. 5. Brief staff.'
          }
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

describe('POST /api/gemini — incident_response action', () => {
  test('returns { success: true } with protocol text on valid request', async () => {
    const res = await geminiPOST(makeReq({
      action: 'incident_response',
      type: 'fire',
      zone: 'Gate A',
      severity: 'high',
      description: 'Small fire near concession stand.'
    }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(typeof data.text).toBe('string')
    expect(data.text.length).toBeGreaterThan(0)
  })

  test('returns 400 when type is missing', async () => {
    const res = await geminiPOST(makeReq({
      action: 'incident_response',
      zone: 'Section 100',
      severity: 'medium'
    }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('type')
  })

  test('returns 400 when zone is missing', async () => {
    const res = await geminiPOST(makeReq({
      action: 'incident_response',
      type: 'medical',
      severity: 'critical'
    }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('zone')
  })

  test('returns 400 when severity is missing', async () => {
    const res = await geminiPOST(makeReq({
      action: 'incident_response',
      type: 'crowd_surge',
      zone: 'Gate C'
    }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('severity')
  })

  test('returns 400 when description exceeds 500 characters', async () => {
    const res = await geminiPOST(makeReq({
      action: 'incident_response',
      type: 'security',
      zone: 'Section 204',
      severity: 'high',
      description: 'x'.repeat(501)
    }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('500')
  })

  test('accepts description of exactly 500 characters without error', async () => {
    const res = await geminiPOST(makeReq({
      action: 'incident_response',
      type: 'security',
      zone: 'Gate B',
      severity: 'low',
      description: 'x'.repeat(500)
    }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  test('works without optional description field', async () => {
    const res = await geminiPOST(makeReq({
      action: 'incident_response',
      type: 'medical',
      zone: 'Concourse B',
      severity: 'medium'
    }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  test('success response has success property equal to true', async () => {
    const res = await geminiPOST(makeReq({
      action: 'incident_response',
      type: 'crowd_control',
      zone: 'Main Entrance',
      severity: 'high'
    }))
    const data = await res.json()
    expect(data).toHaveProperty('success', true)
  })

  test('returns 400 when all required fields are missing', async () => {
    const res = await geminiPOST(makeReq({
      action: 'incident_response'
    }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.success).toBe(false)
  })

  test('accepts language parameter and returns { success: true }', async () => {
    const res = await geminiPOST(makeReq({
      action: 'incident_response',
      type: 'evacuation',
      zone: 'Upper Deck',
      severity: 'critical',
      language: 'fr'
    }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })
})
