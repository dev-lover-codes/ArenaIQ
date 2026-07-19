import { vi } from 'vitest'

export interface MockSupabaseClient {
  postgresChangesCallback: ((payload: { new: unknown }) => void) | null
  auth: {
    getUser: ReturnType<typeof vi.fn>
    signOut: ReturnType<typeof vi.fn>
  }
  from: (table: string) => {
    select: ReturnType<typeof vi.fn>
    eq: ReturnType<typeof vi.fn>
    order: ReturnType<typeof vi.fn>
    insert: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
    single: ReturnType<typeof vi.fn>
    then: (resolve: (v: { data: unknown[]; error: null }) => void) => Promise<void>
  }
  channel: ReturnType<typeof vi.fn>
  removeChannel: ReturnType<typeof vi.fn>
}

interface MockChain {
  select: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  insert: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  single: ReturnType<typeof vi.fn>
  then?: (resolve: (v: { data: unknown[]; error: null }) => void) => Promise<void>
}

export function createMockSupabaseClient(overrides: {
  user?: { id: string; email?: string } | null
  profileData?: Record<string, unknown>
  tableData?: Record<string, unknown[]>
} = {}): MockSupabaseClient {
  const {
    user = { id: 'fake-user-id', email: 'test@example.com' },
    profileData = { role: 'staff', full_name: 'John Doe' },
    tableData = {},
  } = overrides

  const client: MockSupabaseClient = {
    postgresChangesCallback: null,
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn((table: string) => {
      const chain: MockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({ error: null }),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockResolvedValue({ error: null }),
        single: vi.fn().mockResolvedValue({
          data: table === 'profiles' ? profileData : (tableData[table]?.[0] ?? null),
          error: null,
        }),
      }

      // If they chain eq().single() or similar
      chain.order.mockResolvedValue({ data: tableData[table] ?? [], error: null })

      // Support thenable on the chain itself
      chain.then = (resolve: (v: { data: unknown[]; error: null }) => void) => {
        const data = tableData[table] ?? []
        return Promise.resolve(resolve({ data, error: null }))
      }

      return chain as Required<MockChain>
    }),
    channel: vi.fn().mockImplementation(() => ({
      on: vi.fn().mockImplementation((
        _event: string,
        _filter: unknown,
        callback: (payload: { new: unknown }) => void
      ) => {
        client.postgresChangesCallback = callback
        return client.channel()
      }),
      subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
    })),
    removeChannel: vi.fn(),
  }

  return client
}
