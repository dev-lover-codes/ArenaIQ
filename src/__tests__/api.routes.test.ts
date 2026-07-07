import { expect, test, describe, vi, beforeEach } from 'vitest'
import { POST as geminiPOST } from '../app/api/gemini/route'
import { POST as navigatePOST } from '../app/api/navigate/route'
import { POST as chatPOST } from '../app/api/chat/route'
import { GET as simulateGET } from '../app/api/simulate-crowd/route'

// Mock next/headers
vi.mock('next/headers', () => {
  return {
    cookies: async () => {
      return {
        getAll: () => [],
        set: () => {}
      }
    }
  }
})

// Mock Supabase SSR client
vi.mock('@supabase/ssr', () => {
  return {
    createServerClient: vi.fn().mockImplementation(() => {
      return {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'mock-user-id', email: 'crew@arena.iq' } },
            error: null
          })
        },
        from: vi.fn().mockImplementation((table) => {
          const makeBuilder = (dataValue: any) => {
            const builder = {
              then: (onfulfilled: any) => Promise.resolve({ data: dataValue, error: null }).then(onfulfilled),
              eq: () => makeBuilder(dataValue),
              single: () => Promise.resolve({ data: dataValue, error: null }),
              select: () => makeBuilder(dataValue),
              insert: () => makeBuilder({ id: 'new-session-id' }),
              update: () => makeBuilder(dataValue),
            }
            return builder
          }

          let defaultData: any = []
          if (table === 'zones') {
            defaultData = [
              { id: '11111111-1111-1111-1111-111111111111', name: 'Gate A', status: 'open', capacity: 1000, current_occupancy: 100 },
              { id: '22222222-2222-2222-2222-222222222222', name: 'Section 100', status: 'open', capacity: 1000, current_occupancy: 200 }
            ]
          } else if (table === 'zone_edges') {
            defaultData = [
              { zone_a_id: '11111111-1111-1111-1111-111111111111', zone_b_id: '22222222-2222-2222-2222-222222222222', walk_time_seconds: 30 }
            ]
          } else if (table === 'chat_sessions') {
            defaultData = {
              id: 'existing-session-id',
              messages: [
                { role: 'user', parts: [{ text: 'Hello' }] }
              ]
            }
          }

          return makeBuilder(defaultData)
        })
      }
    })
  }
})

// Mock Google Generative AI using a standard class
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return {
          generateContent: async () => {
            return {
              response: {
                text: () => 'Mocked response from Gemini API.'
              }
            }
          },
          startChat: () => {
            return {
              sendMessage: async () => {
                return {
                  response: {
                    text: () => 'Mocked chat response from Gemini API.'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
})

describe('Extended API Route Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://owptcgacyqbmewwojinl.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dummy-anon-key'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'dummy-service-key'
    process.env.GEMINI_API_KEY = 'real-gemini-key'
    
    // Mock global fetch for navigate routing API calls to gemini API
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, text: 'Route guide details.' })
      })
    ) as unknown as typeof global.fetch
  })

  describe('/api/gemini validations', () => {
    test('returns 400 for missing prompt', async () => {
      const mockReq = new Request('http://localhost/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-1.5-flash'
        })
      })
      const response = await geminiPOST(mockReq)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Prompt is required')
    })

    test('returns 400 for prompt over 2000 chars', async () => {
      const mockReq = new Request('http://localhost/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'a'.repeat(2001),
          model: 'gemini-1.5-flash'
        })
      })
      const response = await geminiPOST(mockReq)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Prompt over 2000 chars')
    })

    test('returns 400 for missing model param', async () => {
      const mockReq = new Request('http://localhost/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Where is Gate B?'
        })
      })
      const response = await geminiPOST(mockReq)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Model is required')
    })

    test('calls Gemini and returns text on valid input', async () => {
      const mockReq = new Request('http://localhost/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Where is concession plaza?',
          model: 'gemini-1.5-flash'
        })
      })
      const response = await geminiPOST(mockReq)
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.text).toBe('Mocked response from Gemini API.')
    })
  })

  describe('/api/navigate validations', () => {
    test('returns 400 for missing startZone/endZone', async () => {
      const mockReq = new Request('http://localhost/api/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: 'en'
        })
      })
      const response = await navigatePOST(mockReq)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Start and destination zones are required')
    })

    test('returns path array on valid zone IDs', async () => {
      const mockReq = new Request('http://localhost/api/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startZone: '11111111-1111-1111-1111-111111111111',
          endZone: '22222222-2222-2222-2222-222222222222',
          language: 'es'
        })
      })
      const response = await navigatePOST(mockReq)
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.path).toEqual([
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222'
      ])
      expect(data.explanation).toBe('Route guide details.')
    })
  })

  describe('/api/simulate-crowd', () => {
    test('returns success:true structure', async () => {
      const response = await simulateGET()
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.message).toBe('Crowd movement simulated successfully.')
      expect(data.zones_updated).toBe(2)
    })
  })

  describe('/api/chat validations', () => {
    test('returns 400 for empty message', async () => {
      const mockReq = new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: '',
          sessionId: 'some-session'
        })
      })
      const response = await chatPOST(mockReq)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Message is required')
    })

    test('saves to session and returns reply', async () => {
      const mockReq = new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Can I enter Gate A?',
          sessionId: 'existing-session-id',
          language: 'fr'
        })
      })
      const response = await chatPOST(mockReq)
      if (response.status !== 200) {
        console.log("CHAT ERROR RESPONSE:", await response.json())
      }
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.sessionId).toBe('existing-session-id')
      expect(data.messages).toBeDefined()
    })
  })
})
