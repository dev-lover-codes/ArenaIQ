import { expect, test, describe } from 'vitest'
import { calculateRoute, Zone, Edge } from '../lib/routing'

describe('Dijkstra Routing Algorithm', () => {
  const sampleZones: Zone[] = [
    { id: 'A', name: 'Zone A', status: 'open' },
    { id: 'B', name: 'Zone B', status: 'open' },
    { id: 'C', name: 'Zone C', status: 'open' },
    { id: 'D', name: 'Zone D', status: 'open' },
    { id: 'E', name: 'Zone E', status: 'closed' }, // Closed zone
  ]

  const sampleEdges: Edge[] = [
    // Path A -> B -> D (walk times: 30s + 30s = 60s)
    { zone_a_id: 'A', zone_b_id: 'B', walk_time_seconds: 30 },
    { zone_a_id: 'B', zone_b_id: 'D', walk_time_seconds: 30 },
    
    // Path A -> C -> D (walk times: 40s + 10s = 50s)
    { zone_a_id: 'A', zone_b_id: 'C', walk_time_seconds: 40 },
    { zone_a_id: 'C', zone_b_id: 'D', walk_time_seconds: 10 },

    // Path containing closed zone E (A -> E -> D)
    { zone_a_id: 'A', zone_b_id: 'E', walk_time_seconds: 5 },
    { zone_a_id: 'E', zone_b_id: 'D', walk_time_seconds: 5 },
  ]

  test('should find the physically shortest path', () => {
    // A -> C -> D (50s) is shorter than A -> B -> D (60s)
    const route = calculateRoute(sampleZones, sampleEdges, 'A', 'D')
    expect(route).not.toBeNull()
    expect(route!.path).toEqual(['A', 'C', 'D'])
    expect(route!.rawTime).toBe(50)
  })

  test('should bypass closed zones', () => {
    // E is closed, so A -> E -> D (10s) must not be chosen, should fallback to A -> C -> D (50s)
    const route = calculateRoute(sampleZones, sampleEdges, 'A', 'D')
    expect(route).not.toBeNull()
    expect(route!.path).not.toContain('E')
  })

  test('should route around crowded zones when penalization makes alternative faster', () => {
    // If we mark C as crowded, its weight (40s) gets multiplied by 3 (120s)
    // The path A -> C -> D effective weight becomes 120 + 10 = 130s.
    // The alternative path A -> B -> D effective weight remains 30 + 30 = 60s.
    // So it should route via B.
    const crowdedZones: Zone[] = [
      { id: 'A', name: 'Zone A', status: 'open' },
      { id: 'B', name: 'Zone B', status: 'open' },
      { id: 'C', name: 'Zone C', status: 'crowded' }, // C is crowded
      { id: 'D', name: 'Zone D', status: 'open' },
      { id: 'E', name: 'Zone E', status: 'closed' },
    ]

    const route = calculateRoute(crowdedZones, sampleEdges, 'A', 'D')
    expect(route).not.toBeNull()
    expect(route!.path).toEqual(['A', 'B', 'D'])
    expect(route!.congestedZones).toEqual([]) // B is open, so no congested zones are traversed
  })
})
