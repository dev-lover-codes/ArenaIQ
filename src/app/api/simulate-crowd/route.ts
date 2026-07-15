import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Create a custom admin-level client that uses the service role key to bypass RLS for simulation updates
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseServiceKey) {
    return null
  }

  return createServerClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      cookies: {
        getAll() { return [] },
        setAll() {}
      }
    }
  )
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Authorization check — only staff/admin should trigger crowd simulation
  const authHeader = request.headers.get('authorization')
  const adminSecret = process.env.ADMIN_SECRET
  if (adminSecret && authHeader !== `Bearer ${adminSecret}`) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized.' },
      { status: 401 }
    )
  }

  try {
    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error.' },
        { status: 500 }
      )
    }

    // 1. Fetch current zones
    const { data: zones, error: fetchErr } = await supabase
      .from('zones')
      .select('id, name, capacity, current_occupancy, status')

    if (fetchErr) {
      return NextResponse.json({ success: false, error: fetchErr.message }, { status: 500 })
    }

    if (!zones || zones.length === 0) {
      return NextResponse.json({ success: false, error: 'No zones found in the database. Ensure schema is seeded.' }, { status: 400 })
    }

    const updates = []
    const snapshots = []

    // 2. Nudge occupancy counts
    for (const zone of zones) {
      // Random nudge between -8% and +8% of capacity
      const changeLimit = Math.max(20, Math.floor(zone.capacity * 0.08))
      const nudge = Math.floor((Math.random() - 0.5) * 2 * changeLimit)
      
      let newOccupancy = zone.current_occupancy + nudge
      if (newOccupancy < 0) newOccupancy = 0
      if (newOccupancy > zone.capacity) newOccupancy = zone.capacity

      // Determine density level
      const ratio = newOccupancy / zone.capacity
      let densityLevel = 'low'
      let newStatus = zone.status

      if (ratio >= 0.9) {
        densityLevel = 'critical'
      } else if (ratio >= 0.70) {
        densityLevel = 'high'
      } else if (ratio >= 0.40) {
        densityLevel = 'medium'
      }

      // Automatically mark as crowded if over 85%, unless manually closed
      if (zone.status !== 'closed') {
        newStatus = ratio >= 0.85 ? 'crowded' : 'open'
      }

      updates.push({
        id: zone.id,
        current_occupancy: newOccupancy,
        status: newStatus
      })

      snapshots.push({
        zone_id: zone.id,
        occupancy_count: newOccupancy,
        density_level: densityLevel
      })
    }

    // 3. Update zones table
    for (const update of updates) {
      await supabase
        .from('zones')
        .update({ current_occupancy: update.current_occupancy, status: update.status })
        .eq('id', update.id)
    }

    // 4. Record snapshots
    const { error: snapErr } = await supabase
      .from('crowd_events')
      .insert(snapshots)

    if (snapErr) {
      return NextResponse.json({ success: false, error: snapErr.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Crowd movement simulated successfully.', 
      zones_updated: updates.length 
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown simulation API error'
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 })
  }
}
