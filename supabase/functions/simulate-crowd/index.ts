import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables.')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Fetch current zones
    const { data: zones, error: fetchErr } = await supabase
      .from('zones')
      .select('id, name, capacity, current_occupancy, status')

    if (fetchErr) throw fetchErr

    const updates = []
    const snapshots = []

    // 2. Nudge occupancy counts
    for (const zone of zones) {
      // Random nudge between -8% and +8% of capacity
      const changeLimit = Math.floor(zone.capacity * 0.08)
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

    if (snapErr) throw snapErr

    return new Response(
      JSON.stringify({ success: true, message: 'Crowd movement simulated successfully.', zones_updated: updates.length }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
