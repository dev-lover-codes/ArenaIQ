import { expect, test, describe, vi, beforeEach } from 'vitest'
import { POST as geminiPOST } from '../app/api/gemini/route'
import { POST as navigatePOST } from '../app/api/navigate/route'

// Mock Supabase SSR client
vi.mock('@supabase/ssr', () => {
  return {
    createServerClient: vi.fn().mockImplementation(() => {
      return {
        from: vi.fn().mockImplementation((table) => {
          return {
            select: vi.fn().mockImplementation(() => {
              if (table === 'zones') {
                return Promise.resolve({
                  data: [
                    { id: '11111111-1111-1111-1111-111111111111', name: 'Gate A', status: 'open', capacity: 1000, current_occupancy: 100 },
                    { id: '22222222-2222-2222-2222-222222222222', name: 'Section 100', status: 'open', capacity: 1000, current_occupancy: 200 }
                  ],
                  error: null
                })
              }
              if (table === 'zone_edges') {
                return Promise.resolve({
                  data: [
                    { zone_a_id: '11111111-1111-1111-1111-111111111111', zone_b_id: '22222222-2222-2222-2222-222222222222', walk_time_seconds: 30 }
                  ],
                  error: null
                })
              }
              return Promise.resolve({ data: [], error: null })
            })
          }
        })
      }
    })
  }
})

describe('API Route Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Ensure security checks pass in test environment
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key')
    
    // Mock global fetch for navigate routing API calls to gemini API
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, text: 'Route guide details.' })
      })
    ) as unknown as typeof global.fetch
  })

  test('/api/gemini route handler chat option', async () => {
    const mockReq = new Request('http://localhost/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'chat',
        message: 'Where is the medical station?',
        language: 'en'
      })
    })

    const response = await geminiPOST(mockReq)
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.text).toContain('medical station')
  })

  test('/api/navigate route handler', async () => {
    const mockReq = new Request('http://localhost/api/navigate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startZone: '11111111-1111-1111-1111-111111111111',
        endZone: '22222222-2222-2222-2222-222222222222',
        language: 'en'
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
