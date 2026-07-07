import { expect, test, describe } from 'vitest'
import { calculateRoute, Zone, Edge } from '../lib/routing'

describe('Dijkstra Routing Algorithm - Extended', () => {
  // Setup a full mock stadium graph with Gates and Seating Sections
  const gates = ['Gate-A', 'Gate-B', 'Gate-C']
  const sections = ['Section-101', 'Section-102', 'Section-103', 'Section-201', 'Section-202']
  const concourses = ['Concourse-North', 'Concourse-South', 'Concourse-East', 'Concourse-West']

  const allZones: Zone[] = [
    ...gates.map(id => ({ id, name: id.replace('-', ' '), status: 'open' as const })),
    ...sections.map(id => ({ id, name: id.replace('-', ' '), status: 'open' as const })),
    ...concourses.map(id => ({ id, name: id.replace('-', ' '), status: 'open' as const }))
  ]

  // Connect them so there is always a path between every gate and section
  const edges: Edge[] = [
    { zone_a_id: 'Gate-A', zone_b_id: 'Concourse-North', walk_time_seconds: 10 },
    { zone_a_id: 'Gate-B', zone_b_id: 'Concourse-South', walk_time_seconds: 12 },
    { zone_a_id: 'Gate-C', zone_b_id: 'Concourse-East', walk_time_seconds: 15 },

    { zone_a_id: 'Concourse-North', zone_b_id: 'Concourse-West', walk_time_seconds: 20 },
    { zone_a_id: 'Concourse-South', zone_b_id: 'Concourse-West', walk_time_seconds: 25 },
    { zone_a_id: 'Concourse-East', zone_b_id: 'Concourse-South', walk_time_seconds: 30 },
    { zone_a_id: 'Concourse-North', zone_b_id: 'Concourse-East', walk_time_seconds: 15 },

    { zone_a_id: 'Concourse-North', zone_b_id: 'Section-101', walk_time_seconds: 5 },
    { zone_a_id: 'Concourse-West', zone_b_id: 'Section-102', walk_time_seconds: 8 },
    { zone_a_id: 'Concourse-South', zone_b_id: 'Section-103', walk_time_seconds: 6 },
    { zone_a_id: 'Concourse-East', zone_b_id: 'Section-201', walk_time_seconds: 10 },
    { zone_a_id: 'Concourse-West', zone_b_id: 'Section-202', walk_time_seconds: 14 },
    
    // Bidirectional edges to simulate full navigation concourse
    { zone_a_id: 'Concourse-North', zone_b_id: 'Gate-A', walk_time_seconds: 10 },
    { zone_a_id: 'Concourse-South', zone_b_id: 'Gate-B', walk_time_seconds: 12 },
    { zone_a_id: 'Concourse-East', zone_b_id: 'Gate-C', walk_time_seconds: 15 },
    { zone_a_id: 'Concourse-West', zone_b_id: 'Concourse-North', walk_time_seconds: 20 },
    { zone_a_id: 'Concourse-West', zone_b_id: 'Concourse-South', walk_time_seconds: 25 },
    { zone_a_id: 'Concourse-South', zone_b_id: 'Concourse-East', walk_time_seconds: 30 },
    { zone_a_id: 'Concourse-East', zone_b_id: 'Concourse-North', walk_time_seconds: 15 },
    { zone_a_id: 'Section-101', zone_b_id: 'Concourse-North', walk_time_seconds: 5 },
    { zone_a_id: 'Section-102', zone_b_id: 'Concourse-West', walk_time_seconds: 8 },
    { zone_a_id: 'Section-103', zone_b_id: 'Concourse-South', walk_time_seconds: 6 },
    { zone_a_id: 'Section-201', zone_b_id: 'Concourse-East', walk_time_seconds: 10 },
    { zone_a_id: 'Section-202', zone_b_id: 'Concourse-West', walk_time_seconds: 14 }
  ]

  test('Path exists between every gate and every seating section', () => {
    for (const gate of gates) {
      for (const section of sections) {
        const route = calculateRoute(allZones, edges, gate, section)
        expect(route).not.toBeNull()
        expect(route!.path[0]).toBe(gate)
        expect(route!.path[route!.path.length - 1]).toBe(section)
      }
    }
  })

  test('Crowded zone gets 3x penalty (verify path avoids it when alternative exists)', () => {
    // Setup alternative paths:
    // A -> B (10s) -> D (10s) = 20s
    // A -> C (5s) -> D (5s) = 10s (normally shorter)
    const zones: Zone[] = [
      { id: 'A', name: 'A', status: 'open' },
      { id: 'B', name: 'B', status: 'open' },
      { id: 'C', name: 'C', status: 'crowded' }, // Crowded! Penalty 3x makes C path: 5*3 + 5 = 20s or 5 + 5*3 = 20s depending on where penalty is applied. Let's make sure it chooses B.
      { id: 'D', name: 'D', status: 'open' }
    ]
    const testEdges: Edge[] = [
      { zone_a_id: 'A', zone_b_id: 'B', walk_time_seconds: 10 },
      { zone_a_id: 'B', zone_b_id: 'D', walk_time_seconds: 10 },
      { zone_a_id: 'A', zone_b_id: 'C', walk_time_seconds: 5 },
      { zone_a_id: 'C', zone_b_id: 'D', walk_time_seconds: 5 }
    ]

    // Distance via B: 10 + 10 = 20
    // Distance via C (crowded): C gets 3x weight. In calculateRoute, the neighbor penaltyFactor is applied to neighbor.
    // If we go A -> C, C is neighbor, effective weight is 5 * 3 = 15.
    // If we go C -> D, D is neighbor (open), effective weight is 5 * 1 = 5.
    // Total weighted distance via C = 20.
    // Since distances are equal, let's make B walk times even smaller to guarantee B is chosen.
    testEdges[0].walk_time_seconds = 8
    testEdges[1].walk_time_seconds = 8 // Total 16s via B vs 20s via C

    const route = calculateRoute(zones, testEdges, 'A', 'D')
    expect(route).not.toBeNull()
    expect(route!.path).toEqual(['A', 'B', 'D'])
    expect(route!.congestedZones).toEqual([])
  })

  test('Closed zone is completely skipped', () => {
    const zones: Zone[] = [
      { id: 'A', name: 'A', status: 'open' },
      { id: 'B', name: 'B', status: 'closed' }, // Closed!
      { id: 'C', name: 'C', status: 'open' }
    ]
    const testEdges: Edge[] = [
      { zone_a_id: 'A', zone_b_id: 'B', walk_time_seconds: 5 },
      { zone_a_id: 'B', zone_b_id: 'C', walk_time_seconds: 5 }
    ]
    const route = calculateRoute(zones, testEdges, 'A', 'C')
    expect(route).toBeNull()
  })

  test('Returns null when no path exists', () => {
    const zones: Zone[] = [
      { id: 'A', name: 'A', status: 'open' },
      { id: 'B', name: 'B', status: 'open' }
    ]
    const testEdges: Edge[] = [] // No edges at all
    const route = calculateRoute(zones, testEdges, 'A', 'B')
    expect(route).toBeNull()
  })

  test('Returns single-element array when start === end', () => {
    const zones: Zone[] = [
      { id: 'A', name: 'A', status: 'open' }
    ]
    const route = calculateRoute(zones, [], 'A', 'A')
    expect(route).not.toBeNull()
    expect(route!.path).toEqual(['A'])
    expect(route!.totalTime).toBe(0)
    expect(route!.rawTime).toBe(0)
  })

  test('Handles disconnected graph gracefully (no infinite loop)', () => {
    const zones: Zone[] = [
      { id: 'A', name: 'A', status: 'open' },
      { id: 'B', name: 'B', status: 'open' },
      { id: 'C', name: 'C', status: 'open' }
    ]
    const testEdges: Edge[] = [
      { zone_a_id: 'A', zone_b_id: 'B', walk_time_seconds: 5 }
    ]
    // C is disconnected
    const route = calculateRoute(zones, testEdges, 'A', 'C')
    expect(route).toBeNull()
  })

  test('All zone IDs in the path exist in the input graph', () => {
    const route = calculateRoute(allZones, edges, 'Gate-A', 'Section-101')
    expect(route).not.toBeNull()
    const allZoneIds = new Set(allZones.map(z => z.id))
    route!.path.forEach(id => {
      expect(allZoneIds.has(id)).toBe(true)
    })
  })
})
