export interface Zone {
  id: string
  name: string
  section: string
  capacity: number
  current_occupancy: number
  status: 'open' | 'crowded' | 'closed'
  has_elevator?: boolean
}

export interface Task {
  id: string
  title: string
  description: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed'
  zone_id: string
}

export interface AlertBroadcast {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  created_at: string
}

export interface VolunteerCopilotPayload {
  response: string
  announcement?: string | null
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  escalate: boolean;
  reason: string;
}

export interface Message {
  role: 'user' | 'model'
  text: string
  timestamp?: string
  copilot?: VolunteerCopilotPayload
}

export interface Profile {
  id: string
  role: 'fan' | 'volunteer' | 'staff' | 'organizer'
  full_name?: string
  preferred_language?: string
  home_gate?: string
  onboarding_complete?: boolean
}
