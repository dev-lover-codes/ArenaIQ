import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { calculateRoute, Zone, Edge } from '@/lib/routing'
import type { SupabaseClient } from '@supabase/supabase-js'

function createAdminClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseServiceKey) {
    return null
  }

  return createServerClient(supabaseUrl, supabaseServiceKey, {
    cookies: {
      getAll() { return [] },
      setAll() {}
    }
  })
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { startZone, endZone, language = 'en', wheelchairMode = false } = await request.json()

    if (!startZone || !endZone) {
      return NextResponse.json({ success: false, error: 'Start and destination zones are required.' }, { status: 400 })
    }

    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error.' },
        { status: 500 }
      )
    }

    // 1. Fetch zones and edges
    // O(E log V) Dijkstra — parallel data fetch for efficiency
    const [zonesRes, edgesRes] = await Promise.all([
      supabase.from('zones').select('id, name, status, capacity, current_occupancy, has_elevator'),
      supabase.from('zone_edges').select('zone_a_id, zone_b_id, walk_time_seconds, is_step_free')
    ])

    if (zonesRes.error) throw zonesRes.error
    if (edgesRes.error) throw edgesRes.error

    const zones: Zone[] = zonesRes.data || []
    const edges: Edge[] = edgesRes.data || []

    // 2. Calculate route using Dijkstra
    const route = calculateRoute(zones, edges, startZone, endZone, wheelchairMode)

    if (!route) {
      return NextResponse.json({ 
        success: false, 
        error: 'No available route found. A selected zone may be closed or temporarily unreachable.' 
      }, { status: 200 }) 
    }

    // Map zone IDs in the path to their friendly names
    const zoneMap = new Map<string, string>()
    zones.forEach((z) => zoneMap.set(z.id, z.name))
    const pathNames = route.path.map((id) => zoneMap.get(id) || id)

    // 3. Call centralized /api/gemini
    let explanation = ''
    try {
      const origin = new URL(request.url).origin
      const geminiRes = await fetch(`${origin}/api/gemini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'navigate',
          language,
          startZoneName: zoneMap.get(startZone),
          endZoneName: zoneMap.get(endZone),
          pathNames,
          rawTime: route.rawTime,
          totalTime: route.totalTime,
          congestedZones: route.congestedZones.map((id) => zoneMap.get(id) || id),
          zoneContext: zones.map((z) => ({
            name: z.name,
            occupancy: z.current_occupancy,
            capacity: z.capacity,
            status: z.status
          }))
        })
      })

      const geminiData = await geminiRes.json()
      if (geminiData.success) {
        explanation = geminiData.text
      } else {
        throw new Error(geminiData.error || 'Gemini error')
      }
    } catch {
      // Fallback
      explanation = `[Navigation Guide - ${language.toUpperCase()}] Start at ${pathNames[0]}. Proceed to ${pathNames.slice(1).join(' → ')}. Total walk time: ${Math.round(route.rawTime / 60)} minutes. ${route.congestedZones.length > 0 ? `Caution: ${route.congestedZones.map(id => zoneMap.get(id) || id).join(', ')} is currently crowded.` : ''}`
    }

    return NextResponse.json({
      success: true,
      path: route.path,
      pathNames,
      rawTime: route.rawTime,
      totalTime: route.totalTime,
      congestedZones: route.congestedZones,
      explanation
    })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown navigation API error'
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 })
  }
}
