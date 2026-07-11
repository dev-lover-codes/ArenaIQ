import { expect, test, describe } from 'vitest'
import { calculateRoute, Zone, Edge } from '../lib/routing'

// ─── Shared helpers ────────────────────────────────────────────────────────────

const openZone = (id: string): Zone => ({ id, name: id, status: 'open' })
const crowdedZone = (id: string): Zone => ({ id, name: id, status: 'crowded' })
const closedZone = (id: string): Zone => ({ id, name: id, status: 'closed' })
const edge = (a: string, b: string, t = 10, stepFree = true): Edge => ({
  zone_a_id: a, zone_b_id: b, walk_time_seconds: t, is_step_free: stepFree
})

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('calculateRoute — comprehensive edge cases', () => {

  // ── Existence checks ────────────────────────────────────────────────────────

  test('returns null when startId does not exist in zones array', () => {
    const zones = [openZone('A'), openZone('B')]
    const result = calculateRoute(zones, [edge('A', 'B')], 'NOPE', 'B')
    expect(result).toBeNull()
  })

  test('returns null when endId does not exist in zones array', () => {
    const zones = [openZone('A'), openZone('B')]
    const result = calculateRoute(zones, [edge('A', 'B')], 'A', 'NOPE')
    expect(result).toBeNull()
  })

  // ── Closed zone blocks ──────────────────────────────────────────────────────

  test('returns null when start zone is closed', () => {
    const zones = [closedZone('A'), openZone('B')]
    const result = calculateRoute(zones, [edge('A', 'B')], 'A', 'B')
    expect(result).toBeNull()
  })

  test('returns null when end zone is closed', () => {
    const zones = [openZone('A'), closedZone('B')]
    const result = calculateRoute(zones, [edge('A', 'B')], 'A', 'B')
    expect(result).toBeNull()
  })

  // ── Same start / end ────────────────────────────────────────────────────────

  test('returns single-zone path when startId === endId', () => {
    const zones = [openZone('A'), openZone('B')]
    const result = calculateRoute(zones, [edge('A', 'B')], 'A', 'A')
    expect(result).not.toBeNull()
    expect(result!.path).toEqual(['A'])
    expect(result!.totalTime).toBe(0)
    expect(result!.rawTime).toBe(0)
  })

  // ── Crowded zone avoidance ──────────────────────────────────────────────────

  test('avoids crowded zone when a faster alternative exists', () => {
    // A→B→D = 8+8=16s (no penalty)
    // A→C→D via crowded C = (5*3)+5=20s effective
    const zones = [openZone('A'), openZone('B'), crowdedZone('C'), openZone('D')]
    const edges = [
      edge('A', 'B', 8), edge('B', 'D', 8),
      edge('A', 'C', 5), edge('C', 'D', 5),
    ]
    const result = calculateRoute(zones, edges, 'A', 'D')
    expect(result).not.toBeNull()
    expect(result!.path).toEqual(['A', 'B', 'D'])
    expect(result!.congestedZones).toEqual([])
  })

  test('uses crowded zone when it is the ONLY available path', () => {
    const zones = [openZone('A'), crowdedZone('C'), openZone('D')]
    const edges = [edge('A', 'C', 10), edge('C', 'D', 10)]
    const result = calculateRoute(zones, edges, 'A', 'D')
    expect(result).not.toBeNull()
    expect(result!.path).toContain('C')
    expect(result!.congestedZones).toContain('C')
  })

  // ── congestedZones list accuracy ────────────────────────────────────────────

  test('congestedZones list correctly reflects crowded nodes traversed', () => {
    const zones = [openZone('A'), crowdedZone('B'), crowdedZone('C'), openZone('D')]
    const edges = [edge('A', 'B', 1), edge('B', 'C', 1), edge('C', 'D', 1)]
    const result = calculateRoute(zones, edges, 'A', 'D')
    expect(result).not.toBeNull()
    expect(result!.congestedZones).toContain('B')
    expect(result!.congestedZones).toContain('C')
    expect(result!.congestedZones).not.toContain('A')
    expect(result!.congestedZones).not.toContain('D')
  })

  test('congestedZones is empty when no crowded zones on path', () => {
    const zones = [openZone('A'), openZone('B'), openZone('C')]
    const edges = [edge('A', 'B', 5), edge('B', 'C', 5)]
    const result = calculateRoute(zones, edges, 'A', 'C')
    expect(result!.congestedZones).toEqual([])
  })

  // ── Time invariant ──────────────────────────────────────────────────────────

  test('rawTime is always <= totalTime (penalty only adds time)', () => {
    const zones = [openZone('A'), crowdedZone('B'), openZone('C')]
    const edges = [edge('A', 'B', 10), edge('B', 'C', 10)]
    const result = calculateRoute(zones, edges, 'A', 'C')!
    expect(result.rawTime).toBeLessThanOrEqual(result.totalTime)
  })

  test('rawTime === totalTime when no congestion on path', () => {
    const zones = [openZone('A'), openZone('B'), openZone('C')]
    const edges = [edge('A', 'B', 10), edge('B', 'C', 10)]
    const result = calculateRoute(zones, edges, 'A', 'C')!
    expect(result.rawTime).toBe(result.totalTime)
  })

  // ── Disconnected graph ──────────────────────────────────────────────────────

  test('returns null for a disconnected graph (unreachable end)', () => {
    const zones = [openZone('A'), openZone('B'), openZone('C')]
    const edges = [edge('A', 'B', 5)] // C is isolated
    const result = calculateRoute(zones, edges, 'A', 'C')
    expect(result).toBeNull()
  })

  // ── Path integrity ──────────────────────────────────────────────────────────

  test('path always starts with startId', () => {
    const zones = [openZone('A'), openZone('B'), openZone('C')]
    const edges = [edge('A', 'B', 5), edge('B', 'C', 5)]
    const result = calculateRoute(zones, edges, 'A', 'C')!
    expect(result.path[0]).toBe('A')
  })

  test('path always ends with endId', () => {
    const zones = [openZone('A'), openZone('B'), openZone('C')]
    const edges = [edge('A', 'B', 5), edge('B', 'C', 5)]
    const result = calculateRoute(zones, edges, 'A', 'C')!
    expect(result.path[result.path.length - 1]).toBe('C')
  })

  test('all IDs in path exist in the zones array', () => {
    const zones = [openZone('A'), openZone('B'), openZone('C')]
    const edges = [edge('A', 'B', 5), edge('B', 'C', 5)]
    const result = calculateRoute(zones, edges, 'A', 'C')!
    const zoneIds = new Set(zones.map(z => z.id))
    result.path.forEach(id => expect(zoneIds.has(id)).toBe(true))
  })

  // ── Wheelchair mode ─────────────────────────────────────────────────────────

  test('wheelchair mode skips edges where is_step_free === false', () => {
    // A → B (not step-free) → C  |  Direct path A→C is step-free
    const zones = [openZone('A'), openZone('B'), openZone('C')]
    const edges = [
      edge('A', 'B', 5, false),  // stairs — blocked in wheelchair mode
      edge('B', 'C', 5, false),  // stairs — blocked in wheelchair mode
      edge('A', 'C', 30, true),  // long ramp — only valid wheelchair path
    ]
    const result = calculateRoute(zones, edges, 'A', 'C', true)
    expect(result).not.toBeNull()
    expect(result!.path).not.toContain('B')
    expect(result!.path).toEqual(['A', 'C'])
  })

  test('wheelchair mode returns null when only path has stairs', () => {
    const zones = [openZone('A'), openZone('B')]
    const edges = [edge('A', 'B', 10, false)] // only edge is stairs
    const result = calculateRoute(zones, edges, 'A', 'B', true)
    expect(result).toBeNull()
  })

  test('wheelchair mode uses step-free alternative when available', () => {
    // A→B (fast, stairs) vs A→C→D (slower, fully step-free)
    const zones = [openZone('A'), openZone('B'), openZone('C'), openZone('D')]
    const edges = [
      edge('A', 'B', 5, false),  // stairs — skipped
      edge('A', 'C', 15, true),  // ramp
      edge('C', 'D', 15, true),  // ramp
      edge('B', 'D', 5, false),  // stairs — skipped
    ]
    // Only step-free path: A→C→D (B is inaccessible via wheelchair)
    const result = calculateRoute(zones, edges, 'A', 'D', true)
    expect(result).not.toBeNull()
    expect(result!.path).toEqual(['A', 'C', 'D'])
  })

  test('wheelchair mode with wheelchairMode=false uses all edges normally', () => {
    const zones = [openZone('A'), openZone('B')]
    const edges = [edge('A', 'B', 10, false)] // stairs, but mode is off
    const result = calculateRoute(zones, edges, 'A', 'B', false)
    expect(result).not.toBeNull()
    expect(result!.path).toEqual(['A', 'B'])
  })

  test('wheelchair mode default is false (no parameter needed)', () => {
    const zones = [openZone('A'), openZone('B')]
    const edges = [edge('A', 'B', 10, false)] // stairs
    // default wheelchairMode = false → should succeed
    const result = calculateRoute(zones, edges, 'A', 'B')
    expect(result).not.toBeNull()
  })
})
