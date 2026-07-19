import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Zone } from '@/types';

export interface RouteResponse {
  success: boolean;
  path?: string[];
  pathNames?: string[];
  rawTime?: number;
  totalTime?: number;
  congestedZones?: string[];
  explanation?: string;
  error?: string;
}

/**
 * Custom React hook for driving the Smart Route Planner UI.
 * Connects departure/destination selection states, accessibility toggles,
 * localized language configurations, and handles the API requests to Dijkstra & Gemini server endpoints.
 * 
 * @returns State properties and change handlers for navigation forms and routing outcomes.
 */
export function useRoutePlanner() {
  // Stabilize the client so the effect dep doesn't change on every render.
  const supabaseRef = useRef<SupabaseClient | null>(null);
  if (!supabaseRef.current) supabaseRef.current = createClient();
  const supabase = supabaseRef.current;

  const [zones, setZones] = useState<Zone[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [startZone, setStartZone] = useState('');
  const [endZone, setEndZone] = useState('');
  const [language, setLanguage] = useState('en');
  const [wheelchairMode, setWheelchairMode] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteResponse | null>(null);
  const [liveNavAnnouncement, setLiveNavAnnouncement] = useState('');

  useEffect(() => {
    const fetchZones = async () => {
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .order('name', { ascending: true });
      if (!error && data) setZones(data);
      setLoadingZones(false);
    };
    fetchZones();
  // supabase is stabilized via useRef — empty dep array is correct here.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGetRoute = async () => {
    if (!startZone || !endZone) return;

    setCalculating(true);
    setRouteResult(null);
    setLiveNavAnnouncement('Calculating optimal route and generating step-by-step instructions…');

    try {
      const res = await fetch('/api/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startZone, endZone, language, wheelchairMode }),
      });
      const data: RouteResponse = await res.json();
      setRouteResult(data);
      if (data.success) {
        setLiveNavAnnouncement(`Route calculated. Estimated ${Math.round((data.rawTime || 0) / 60)} minutes. Instructions ready.`);
      } else {
        setLiveNavAnnouncement(`Routing failed: ${data.error || 'No path found.'}`);
      }
    } catch {
      setRouteResult({ success: false, error: 'Network error calculating route. Please check connection.' });
      setLiveNavAnnouncement('Error calculating route.');
    } finally {
      setCalculating(false);
    }
  };

  return {
    zones,
    loadingZones,
    startZone,
    setStartZone,
    endZone,
    setEndZone,
    language,
    setLanguage,
    wheelchairMode,
    setWheelchairMode,
    calculating,
    routeResult,
    liveNavAnnouncement,
    handleGetRoute
  };
}
