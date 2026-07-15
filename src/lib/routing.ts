export interface Edge {
  zone_a_id: string
  zone_b_id: string
  walk_time_seconds: number
  is_step_free?: boolean
}

export interface Zone {
  id: string
  name: string
  status: 'open' | 'crowded' | 'closed'
  capacity?: number
  current_occupancy?: number
  has_elevator?: boolean
}

export interface RouteResult {
  path: string[]           // List of zone IDs
  totalTime: number        // Total walk time in seconds (including penalties)
  rawTime: number          // Raw physical walk time in seconds
  congestedZones: string[] // List of crowded zones traversed
}

/**
 * Calculates the optimal route between two stadium zones using Dijkstra's algorithm.
 * Accounts for crowded zones by applying a traversal penalty (3×), and avoids
 * closed zones entirely. In wheelchair mode, edges where `is_step_free === false`
 * are skipped.
 *
 * @param zones - Array of stadium zones with id, name, and occupancy status
 * @param edges - Array of bidirectional connections between zones
 * @param startId - The ID of the starting zone
 * @param endId - The ID of the destination zone
 * @param wheelchairMode - When true, only step-free edges are traversed
 * @returns A RouteResult with the optimal path, or null if no path exists
 */
export function calculateRoute(
  zones: Zone[],
  edges: Edge[],
  startId: string,
  endId: string,
  wheelchairMode: boolean = false
): RouteResult | null {
  // Create mapping of zone ID to status
  const zoneMap = new Map<string, Zone>()
  zones.forEach((z) => zoneMap.set(z.id, z))

  // Verify start and end zones exist and are not closed
  const startZone = zoneMap.get(startId)
  const endZone = zoneMap.get(endId)
  if (!startZone || !endZone || startZone.status === 'closed' || endZone.status === 'closed') {
    return null
  }

  // Build adjacency list
  // adj[node] = Array of { neighborId, weight }
  const adj = new Map<string, Array<{ neighborId: string; physicalTime: number }>>()
  
  // Initialize adjacency map
  zones.forEach((z) => adj.set(z.id, []))

  // Populate adjacency list
  edges.forEach((edge) => {
    const fromZone = zoneMap.get(edge.zone_a_id)
    const toZone = zoneMap.get(edge.zone_b_id)

    // Skip edge if either zone is closed or doesn't exist
    if (!fromZone || !toZone || fromZone.status === 'closed' || toZone.status === 'closed') {
      return
    }

    // In wheelchair mode, skip edges that are not step-free
    // is_step_free defaults to true if not specified (backward compatible)
    if (wheelchairMode && edge.is_step_free === false) {
      return
    }

    // Add connection in adjacency list
    const list = adj.get(edge.zone_a_id) || []
    list.push({ neighborId: edge.zone_b_id, physicalTime: edge.walk_time_seconds })
    adj.set(edge.zone_a_id, list)
  })

  // Dijkstra state
  const distances = new Map<string, number>()
  const rawDistances = new Map<string, number>()
  const previous = new Map<string, string | null>()
  const unvisited = new Set<string>()

  // Initialize state
  zones.forEach((z) => {
    if (z.status !== 'closed') {
      distances.set(z.id, Infinity)
      rawDistances.set(z.id, Infinity)
      previous.set(z.id, null)
      unvisited.add(z.id)
    }
  })

  distances.set(startId, 0)
  rawDistances.set(startId, 0)

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let currentNode: string | null = null
    let minDistance = Infinity

    unvisited.forEach((node) => {
      const dist = distances.get(node) ?? Infinity
      if (dist < minDistance) {
        minDistance = dist
        currentNode = node
      }
    })

    if (currentNode === null || minDistance === Infinity) {
      break // Remaining nodes are unreachable
    }

    if (currentNode === endId) {
      break // Found shortest path to target
    }

    unvisited.delete(currentNode)

    // Check neighbors
    const neighbors = adj.get(currentNode) || []
    for (const neighbor of neighbors) {
      const neighborId = neighbor.neighborId
      if (!unvisited.has(neighborId)) continue

      const neighborZone = zoneMap.get(neighborId)
      if (!neighborZone) continue

      // Apply congestion penalty:
      // If neighbor zone is 'crowded', multiply walk time by 3 (heavy routing aversion)
      const penaltyFactor = neighborZone.status === 'crowded' ? 3.0 : 1.0
      const effectiveWeight = neighbor.physicalTime * penaltyFactor

      const currentDist = distances.get(currentNode) ?? Infinity
      const currentRawDist = rawDistances.get(currentNode) ?? Infinity

      const newDist = currentDist + effectiveWeight
      const newRawDist = currentRawDist + neighbor.physicalTime

      const existingDist = distances.get(neighborId) ?? Infinity
      if (newDist < existingDist) {
        distances.set(neighborId, newDist)
        rawDistances.set(neighborId, newRawDist)
        previous.set(neighborId, currentNode)
      }
    }
  }

  // Reconstruct path
  const path: string[] = []
  let curr: string | null = endId
  while (curr !== null) {
    path.push(curr)
    curr = previous.get(curr) ?? null
  }
  path.reverse()

  // If path doesn't start with startId, it means endId is unreachable
  if (path[0] !== startId) {
    return null
  }

  // Identify congested zones along path
  const congestedZones = path.filter((nodeId) => zoneMap.get(nodeId)?.status === 'crowded')

  return {
    path,
    totalTime: distances.get(endId) ?? Infinity,
    rawTime: rawDistances.get(endId) ?? Infinity,
    congestedZones,
  }
}
