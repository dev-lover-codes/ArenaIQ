import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useZones } from '../hooks/useZones'
import { useRoutePlanner } from '../hooks/useRoutePlanner'
import { useChatSession } from '../hooks/useChatSession'
import { useStaffTasks } from '../hooks/useStaffTasks'

// ─── useRouter Mock ─────────────────────────────────────────────────────────
const mockRouter = {
  push: vi.fn(),
}

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
}))

// ─── Supabase Client Mock ──────────────────────────────────────────────────
import { createMockSupabaseClient } from './test-utils/mockSupabase'

const mockZonesData = [
  { id: 'z1', name: 'Gate A', capacity: 1000, current_occupancy: 300, status: 'open', section: 'North Stand' },
  { id: 'z2', name: 'Gate B', capacity: 1200, current_occupancy: 500, status: 'crowded', section: 'East Stand' },
]

const stubSupabaseClient = createMockSupabaseClient({
  profileData: { role: 'staff', full_name: 'John Staff' },
  tableData: {
    zones: mockZonesData,
    staff_tasks: [
      { id: 't1', title: 'Check barriers', description: 'barriers', priority: 'high', status: 'pending', zone_id: 'z1' }
    ],
    chat_sessions: [
      { messages: [{ role: 'user', text: 'Hello previous' }] }
    ]
  }
})

const postgresChangesCallback = (payload: { new: unknown }) => {
  if (stubSupabaseClient.postgresChangesCallback) {
    stubSupabaseClient.postgresChangesCallback(payload)
  }
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => stubSupabaseClient,
}))

describe('useZones Hook', () => {
  it('returns zones array after fetch resolves, sets loading false', async () => {
    const { result } = renderHook(() => useZones())

    expect(result.current.loading).toBe(true)

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.zones).toEqual(mockZonesData)
  })

  it('updates liveAnnouncement when a postgres UPDATE event fires', async () => {
    const { result } = renderHook(() => useZones())

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(postgresChangesCallback).toBeTypeOf('function')

    await act(async () => {
      postgresChangesCallback({
        new: {
          id: 'z1',
          name: 'Gate A',
          capacity: 1000,
          current_occupancy: 950,
          status: 'closed',
        },
      })
    })

    expect(result.current.liveAnnouncement).toContain('Gate A occupancy updated to 950 out of 1000')
    expect(result.current.liveAnnouncement).toContain('Density status is now critical')
  })

  it('triggers crowd simulation successfully', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    const { result } = renderHook(() => useZones())
    await act(async () => {
      await result.current.triggerSimulation()
    })

    expect(fetchSpy).toHaveBeenCalledWith('/api/simulate-crowd')
    expect(result.current.simulating).toBe(false)
    expect(result.current.simError).toBeNull()
    fetchSpy.mockRestore()
  })

  it('sets simError on simulation failure', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({ success: false, error: 'Sim failed' }),
    } as Response)

    const { result } = renderHook(() => useZones())
    await act(async () => {
      await result.current.triggerSimulation()
    })

    expect(result.current.simError).toBe('Sim failed')
    fetchSpy.mockRestore()
  })
})

describe('useRoutePlanner Hook', () => {
  it('calls handleGetRoute with correct payload and updates results', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        path: ['z1', 'z2'],
        pathNames: ['Gate A', 'Gate B'],
        rawTime: 300,
        explanation: 'Go straight',
      }),
    } as Response)

    const { result } = renderHook(() => useRoutePlanner())

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    act(() => {
      result.current.setStartZone('z1')
      result.current.setEndZone('z2')
      result.current.setLanguage('es')
      result.current.setWheelchairMode(true)
    })

    await act(async () => {
      await result.current.handleGetRoute()
    })

    expect(fetchSpy).toHaveBeenCalledWith('/api/navigate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startZone: 'z1',
        endZone: 'z2',
        language: 'es',
        wheelchairMode: true,
      }),
    })

    expect(result.current.routeResult).toEqual({
      success: true,
      path: ['z1', 'z2'],
      pathNames: ['Gate A', 'Gate B'],
      rawTime: 300,
      explanation: 'Go straight',
    })
    expect(result.current.liveNavAnnouncement).toContain('Route calculated')
    fetchSpy.mockRestore()
  })

  it('sets error state when API returns non-200 or failure', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: false,
        error: 'Routing api error',
      }),
    } as Response)

    const { result } = renderHook(() => useRoutePlanner())

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    act(() => {
      result.current.setStartZone('z1')
      result.current.setEndZone('z2')
    })

    await act(async () => {
      await result.current.handleGetRoute()
    })

    expect(result.current.routeResult?.success).toBe(false)
    expect(result.current.routeResult?.error).toBe('Routing api error')
    expect(result.current.liveNavAnnouncement).toContain('Routing failed: Routing api error')
    fetchSpy.mockRestore()
  })
})

describe('useChatSession Hook', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('appends user message optimistically before API response, appends assistant response after', async () => {
    let resolveFetch: ((value: Response) => void) | null = null
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve
    })
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockReturnValue(fetchPromise)

    const { result } = renderHook(() => useChatSession())

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    act(() => {
      result.current.setInputMsg('Hello assistant')
    })

    let sendPromise: Promise<void> | undefined
    act(() => {
      sendPromise = result.current.handleSendMessage()
    })

    // Optimistic user message append check
    expect(result.current.inputMsg).toBe('')
    expect(result.current.sending).toBe(true)
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0]).toEqual(
      expect.objectContaining({
        role: 'user',
        text: 'Hello assistant',
      })
    )

    // Resolve API call
    await act(async () => {
      resolveFetch({
        ok: true,
        json: async () => ({
          success: true,
          sessionId: 'session-123',
          messages: [
            { role: 'user', text: 'Hello assistant' },
            { role: 'model', text: 'Hello human!' },
          ],
        }),
      } as Response)
      await sendPromise
    })

    // Assistant response append check
    expect(result.current.sending).toBe(false)
    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[1]).toEqual(
      expect.objectContaining({
        role: 'model',
        text: 'Hello human!',
      })
    )

    fetchSpy.mockRestore()
  })
})

describe('useStaffTasks Hook', () => {
  it('returns profile, zones, and tasks after resolving getUser and table fetches', async () => {
    const { result } = renderHook(() => useStaffTasks())

    expect(result.current.loading).toBe(true)

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.profile?.full_name).toBe('John Staff')
    expect(result.current.zones).toHaveLength(2)
    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].title).toBe('Check barriers')
  })

  it('updates zone status successfully', async () => {
    const { result } = renderHook(() => useStaffTasks())
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    const updateSpy = vi.spyOn(stubSupabaseClient, 'from')
    await act(async () => {
      await result.current.updateZoneStatus('z1', 'closed')
    })
    expect(updateSpy).toHaveBeenCalledWith('zones')
  })

  it('broadcasts alert successfully', async () => {
    const { result } = renderHook(() => useStaffTasks())
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    const insertSpy = vi.spyOn(stubSupabaseClient, 'from')
    await act(async () => {
      await result.current.broadcastAlert('Security incident', 'high', 'z1')
    })
    expect(insertSpy).toHaveBeenCalledWith('crowd_events')
  })
})
