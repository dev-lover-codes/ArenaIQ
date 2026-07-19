/**
 * Tests for the real production components:
 *  - RouteForm       (src/components/navigate/RouteForm.tsx)
 *  - MessageBubble   (src/components/assistant/MessageBubble.tsx)
 *  - ZoneCard        (src/components/dashboard/ZoneCard.tsx)
 *  - StatCard        (src/components/dashboard/StatCard.tsx)
 *  - TaskCard        (src/components/staff/TaskCard.tsx)
 */
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// ─── useRouter Mock ─────────────────────────────────────────────────────────
const mockRouter = {
  push: vi.fn(),
  refresh: vi.fn(),
}

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
}))

// ─── Supabase Client Mock ──────────────────────────────────────────────────
import { createMockSupabaseClient } from './test-utils/mockSupabase'

const stubClient = createMockSupabaseClient({
  profileData: { role: 'staff', full_name: 'John Doe' },
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => stubClient,
}))

// ─── Component imports ───────────────────────────────────────────────────────
import RouteForm from '../components/navigate/RouteForm'
import MessageBubble from '../components/assistant/MessageBubble'
import ZoneCard from '../components/dashboard/ZoneCard'
import StatCard from '../components/dashboard/StatCard'
import TaskCard from '../components/staff/TaskCard'
import MatchScoreboard from '../components/dashboard/MatchScoreboard'
import BroadcastForm from '../components/staff/BroadcastForm'
import ZoneStatusTable from '../components/staff/ZoneStatusTable'
import RouteAlerts from '../components/navigate/RouteAlerts'
import SpatialPathBreakdown from '../components/navigate/SpatialPathBreakdown'
import PAAnnouncementPanel from '../components/assistant/PAAnnouncementPanel'
import AppShell from '../components/layout/AppShell'
import LiveAlertsFeed from '../components/staff/LiveAlertsFeed'

// ─── Shared test data ────────────────────────────────────────────────────────
const MOCK_ZONES = [
  { id: 'z1', name: 'Gate A',      status: 'open'    as const },
  { id: 'z2', name: 'Section 102', status: 'crowded' as const },
  { id: 'z3', name: 'Gate B',      status: 'closed'  as const },
]

const BASE_ROUTE_FORM_PROPS = {
  zones: MOCK_ZONES,
  startZone: '',
  setStartZone: vi.fn(),
  endZone: '',
  setEndZone: vi.fn(),
  language: 'en',
  setLanguage: vi.fn(),
  wheelchairMode: false,
  setWheelchairMode: vi.fn(),
  calculating: false,
  onSubmit: vi.fn(),
}

// ─────────────────────────────────────────────────────────────────────────────
// RouteForm
// ─────────────────────────────────────────────────────────────────────────────
describe('RouteForm', () => {
  it('renders start zone and end zone selects', () => {
    render(<RouteForm {...BASE_ROUTE_FORM_PROPS} />)
    expect(screen.getByRole('combobox', { name: /departure zone/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /destination zone/i })).toBeInTheDocument()
  })

  it('renders all zones as options in the start select', () => {
    render(<RouteForm {...BASE_ROUTE_FORM_PROPS} />)
    const startSelect = screen.getByRole('combobox', { name: /departure zone/i })
    expect(startSelect).toBeInTheDocument()
    expect(screen.getAllByText(/Gate A/).length).toBeGreaterThan(0)
  })

  it('calls setStartZone when departure select changes', () => {
    const setStartZone = vi.fn()
    render(<RouteForm {...BASE_ROUTE_FORM_PROPS} setStartZone={setStartZone} />)
    const startSelect = screen.getByRole('combobox', { name: /departure zone/i })
    fireEvent.change(startSelect, { target: { value: 'z1' } })
    expect(setStartZone).toHaveBeenCalledWith('z1')
  })

  it('calls setEndZone when destination select changes', () => {
    const setEndZone = vi.fn()
    render(<RouteForm {...BASE_ROUTE_FORM_PROPS} setEndZone={setEndZone} />)
    const endSelect = screen.getByRole('combobox', { name: /destination zone/i })
    fireEvent.change(endSelect, { target: { value: 'z2' } })
    expect(setEndZone).toHaveBeenCalledWith('z2')
  })

  it('submit button is disabled when no zones are selected', () => {
    render(<RouteForm {...BASE_ROUTE_FORM_PROPS} startZone="" endZone="" />)
    expect(screen.getByRole('button', { name: /Calculate optimal route/i })).toBeDisabled()
  })

  it('submit button is enabled when both zones are selected', () => {
    render(<RouteForm {...BASE_ROUTE_FORM_PROPS} startZone="z1" endZone="z2" />)
    expect(screen.getByRole('button', { name: /Calculate optimal route/i })).not.toBeDisabled()
  })

  it('submit button is disabled when calculating', () => {
    render(<RouteForm {...BASE_ROUTE_FORM_PROPS} startZone="z1" endZone="z2" calculating={true} />)
    const btn = screen.getByRole('button', { name: /Calculate optimal route/i })
    expect(btn).toBeDisabled()
    expect(btn).toHaveTextContent(/Optimizing Path/i)
  })

  it('calls onSubmit when form is submitted', () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    render(<RouteForm {...BASE_ROUTE_FORM_PROPS} startZone="z1" endZone="z2" onSubmit={onSubmit} />)
    const btn = screen.getByRole('button', { name: /Calculate optimal route/i })
    fireEvent.click(btn)
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('calls setWheelchairMode when toggle changes', () => {
    const setWheelchairMode = vi.fn()
    render(<RouteForm {...BASE_ROUTE_FORM_PROPS} setWheelchairMode={setWheelchairMode} />)
    const toggle = screen.getByRole('checkbox', { name: /wheelchair accessible/i })
    fireEvent.click(toggle)
    expect(setWheelchairMode).toHaveBeenCalledWith(true)
  })

  it('calls setLanguage when language select changes', () => {
    const setLanguage = vi.fn()
    render(<RouteForm {...BASE_ROUTE_FORM_PROPS} setLanguage={setLanguage} />)
    const langSelect = screen.getByRole('combobox', { name: /AI Guide Language/i })
    fireEvent.change(langSelect, { target: { value: 'es' } })
    expect(setLanguage).toHaveBeenCalledWith('es')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// MessageBubble
// ─────────────────────────────────────────────────────────────────────────────
describe('MessageBubble', () => {
  it('renders user message text', () => {
    const msg = { role: 'user' as const, text: 'Where is Gate A?' }
    render(<MessageBubble msg={msg} language="en" />)
    expect(screen.getByText('Where is Gate A?')).toBeInTheDocument()
  })

  it('user message has right-aligned container (justify-end)', () => {
    const msg = { role: 'user' as const, text: 'Hello' }
    const { container } = render(<MessageBubble msg={msg} language="en" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('justify-end')
  })

  it('assistant message has left-aligned container (justify-start)', () => {
    const msg = { role: 'model' as const, text: 'Welcome!' }
    const { container } = render(<MessageBubble msg={msg} language="en" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('justify-start')
  })

  it('renders ArenaIQ label for assistant messages', () => {
    const msg = { role: 'model' as const, text: 'Hello fan' }
    render(<MessageBubble msg={msg} language="en" />)
    expect(screen.getByText('ArenaIQ')).toBeInTheDocument()
  })

  it('does not render urgency badge for plain user messages', () => {
    const msg = { role: 'user' as const, text: 'Hi' }
    render(<MessageBubble msg={msg} language="en" />)
    expect(screen.queryByText('CRITICAL')).not.toBeInTheDocument()
    expect(screen.queryByText('LOW')).not.toBeInTheDocument()
  })

  it('renders urgency badge when copilot data is present', () => {
    const msg = {
      role: 'model' as const,
      text: 'Fan needs help',
      copilot: {
        response: 'Fan needs help',
        urgency: 'HIGH' as const,
        escalate: false,
        reason: 'Possible medical issue',
        announcement: null,
      },
    }
    render(<MessageBubble msg={msg} language="en" />)
    expect(screen.getByText('HIGH')).toBeInTheDocument()
  })

  it('renders ESCALATE badge when escalate is true', () => {
    const msg = {
      role: 'model' as const,
      text: 'Critical situation',
      copilot: {
        response: 'Critical situation',
        urgency: 'CRITICAL' as const,
        escalate: true,
        reason: 'Medical emergency',
        announcement: null,
      },
    }
    render(<MessageBubble msg={msg} language="en" />)
    expect(screen.getByText(/ESCALATE/i)).toBeInTheDocument()
  })

  it('does not render ESCALATE badge when escalate is false', () => {
    const msg = {
      role: 'model' as const,
      text: 'Routine query',
      copilot: {
        response: 'Routine query',
        urgency: 'LOW' as const,
        escalate: false,
        reason: 'Routine',
        announcement: null,
      },
    }
    render(<MessageBubble msg={msg} language="en" />)
    expect(screen.queryByText(/ESCALATE/i)).not.toBeInTheDocument()
  })

  it('renders the reason text from copilot payload', () => {
    const msg = {
      role: 'model' as const,
      text: 'Respond immediately',
      copilot: {
        response: 'Respond immediately',
        urgency: 'HIGH' as const,
        escalate: false,
        reason: 'Fan showed signs of distress',
        announcement: null,
      },
    }
    render(<MessageBubble msg={msg} language="en" />)
    expect(screen.getByText('Fan showed signs of distress')).toBeInTheDocument()
  })

  it('renders timestamp when provided', () => {
    const msg = { role: 'user' as const, text: 'Hi', timestamp: '14:32' }
    render(<MessageBubble msg={msg} language="en" />)
    expect(screen.getByText('14:32')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// ZoneCard
// ─────────────────────────────────────────────────────────────────────────────
describe('ZoneCard', () => {
  const makeZone = (overrides = {}) => ({
    id: 'z1',
    name: 'Gate A',
    section: 'North Stand',
    capacity: 1000,
    current_occupancy: 500,
    status: 'open' as const,
    ...overrides,
  })

  it('renders zone name', () => {
    render(<ZoneCard zone={makeZone()} onClick={vi.fn()} onKeyDown={vi.fn()} />)
    expect(screen.getByText('Gate A')).toBeInTheDocument()
  })

  it('renders occupancy and capacity', () => {
    render(<ZoneCard zone={makeZone()} onClick={vi.fn()} onKeyDown={vi.fn()} />)
    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('1,000')).toBeInTheDocument()
  })

  it('renders formatted capacity', () => {
    render(<ZoneCard zone={makeZone({ capacity: 1000 })} onClick={vi.fn()} onKeyDown={vi.fn()} />)
    expect(screen.getByText('1,000')).toBeInTheDocument()
  })

  it('renders percentage of capacity', () => {
    render(<ZoneCard zone={makeZone({ current_occupancy: 750, capacity: 1000 })} onClick={vi.fn()} onKeyDown={vi.fn()} />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('shows OPEN badge for low occupancy (< 40%)', () => {
    render(<ZoneCard zone={makeZone({ current_occupancy: 300, capacity: 1000 })} onClick={vi.fn()} onKeyDown={vi.fn()} />)
    expect(screen.getByText('OPEN')).toBeInTheDocument()
  })

  it('shows FILLING badge for medium occupancy (40–69%)', () => {
    render(<ZoneCard zone={makeZone({ current_occupancy: 500, capacity: 1000 })} onClick={vi.fn()} onKeyDown={vi.fn()} />)
    expect(screen.getByText('FILLING')).toBeInTheDocument()
  })

  it('shows CROWDED badge for high occupancy (70–89%)', () => {
    render(<ZoneCard zone={makeZone({ current_occupancy: 750, capacity: 1000 })} onClick={vi.fn()} onKeyDown={vi.fn()} />)
    expect(screen.getByText('CROWDED')).toBeInTheDocument()
  })

  it('shows CRITICAL badge for critical occupancy (≥ 90%)', () => {
    render(<ZoneCard zone={makeZone({ current_occupancy: 950, capacity: 1000 })} onClick={vi.fn()} onKeyDown={vi.fn()} />)
    expect(screen.getByText('CRITICAL')).toBeInTheDocument()
  })

  it('applies correct color class for low density (open)', () => {
    const { container } = render(<ZoneCard zone={makeZone({ current_occupancy: 300, capacity: 1000 })} onClick={vi.fn()} onKeyDown={vi.fn()} />)
    const indicator = container.querySelector('.bg-emerald-500')
    expect(indicator).toBeInTheDocument()
  })

  it('applies correct color class for medium-high density (crowded)', () => {
    const { container } = render(<ZoneCard zone={makeZone({ current_occupancy: 750, capacity: 1000 })} onClick={vi.fn()} onKeyDown={vi.fn()} />)
    const indicator = container.querySelector('.bg-orange-500')
    expect(indicator).toBeInTheDocument()
  })

  it('applies correct color class for critical density (critical)', () => {
    const { container } = render(<ZoneCard zone={makeZone({ current_occupancy: 950, capacity: 1000 })} onClick={vi.fn()} onKeyDown={vi.fn()} />)
    const indicator = container.querySelector('.bg-red-500')
    expect(indicator).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn()
    render(<ZoneCard zone={makeZone()} onClick={onClick} onKeyDown={vi.fn()} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('calls onKeyDown when key is pressed', () => {
    const onKeyDown = vi.fn()
    render(<ZoneCard zone={makeZone()} onClick={vi.fn()} onKeyDown={onKeyDown} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
    expect(onKeyDown).toHaveBeenCalledTimes(1)
  })

  it('has accessible aria-label with name and percentage', () => {
    render(<ZoneCard zone={makeZone({ current_occupancy: 500, capacity: 1000 })} onClick={vi.fn()} onKeyDown={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', expect.stringContaining('Gate A'))
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', expect.stringContaining('50%'))
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// StatCard
// ─────────────────────────────────────────────────────────────────────────────
describe('StatCard', () => {
  const baseProps = {
    title: 'Total Fans',
    value: '42,000',
    icon: <span data-testid="stat-icon">🏟️</span>,
    iconBgClass: 'bg-gold/10',
  }

  it('renders the title (label)', () => {
    render(<StatCard {...baseProps} />)
    expect(screen.getByText('Total Fans')).toBeInTheDocument()
  })

  it('renders the value', () => {
    render(<StatCard {...baseProps} />)
    expect(screen.getByText('42,000')).toBeInTheDocument()
  })

  it('renders optional trend/awareness text when provided', () => {
    render(<StatCard {...baseProps} trend="Up 12% from last game" />)
    expect(screen.getByText('Up 12% from last game')).toBeInTheDocument()
  })

  it('omits trend/awareness text when not provided', () => {
    render(<StatCard {...baseProps} />)
    expect(screen.queryByText('Up 12% from last game')).not.toBeInTheDocument()
  })

  it('renders the icon slot', () => {
    render(<StatCard {...baseProps} />)
    expect(screen.getByTestId('stat-icon')).toBeInTheDocument()
  })

  it('renders numeric value correctly', () => {
    render(<StatCard {...baseProps} value={12345} />)
    expect(screen.getByText('12345')).toBeInTheDocument()
  })

  it('applies iconBgClass to the icon wrapper', () => {
    const { container } = render(<StatCard {...baseProps} />)
    const iconSpan = container.querySelector('span')
    expect(iconSpan?.className).toContain('bg-gold/10')
  })

  it('applies valueStyle when provided', () => {
    render(<StatCard {...baseProps} valueStyle={{ color: 'red' }} />)
    const statNum = screen.getByText('42,000')
    expect(statNum.style.color).toBe('red')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TaskCard
// ─────────────────────────────────────────────────────────────────────────────
describe('TaskCard', () => {
  const ZONES = [
    { id: 'z1', name: 'Gate A', section: 'North', capacity: 1000, current_occupancy: 500, status: 'open' as const },
  ]

  const makeTask = (overrides = {}) => ({
    id: 't1',
    title: 'Check Zone Barriers',
    description: 'Inspect crowd control barriers near Gate A',
    priority: 'high' as const,
    status: 'pending' as const,
    zone_id: 'z1',
    ...overrides,
  })

  it('renders task title', () => {
    render(<TaskCard task={makeTask()} zones={ZONES} />)
    expect(screen.getByText('Check Zone Barriers')).toBeInTheDocument()
  })

  it('renders task description when provided', () => {
    render(<TaskCard task={makeTask()} zones={ZONES} />)
    expect(screen.getByText(/Inspect crowd control/i)).toBeInTheDocument()
  })

  it('omits description element when description is null', () => {
    render(<TaskCard task={makeTask({ description: null })} zones={ZONES} />)
    expect(screen.queryByText(/Inspect crowd control/i)).not.toBeInTheDocument()
  })

  it('renders zone name from zones list', () => {
    render(<TaskCard task={makeTask()} zones={ZONES} />)
    expect(screen.getByText(/Location Ref:\s*Gate A/)).toBeInTheDocument()
  })

  it('shows "Unknown Zone" when zone_id does not match', () => {
    render(<TaskCard task={makeTask({ zone_id: 'nonexistent' })} zones={ZONES} />)
    expect(screen.getByText(/Unknown Zone/)).toBeInTheDocument()
  })

  it('renders "urgent" priority badge with red classes', () => {
    render(<TaskCard task={makeTask({ priority: 'urgent' })} zones={ZONES} />)
    const badge = screen.getByText('urgent')
    expect(badge.className).toContain('bg-red-500')
  })

  it('renders "high" priority badge with orange classes', () => {
    render(<TaskCard task={makeTask({ priority: 'high' })} zones={ZONES} />)
    const badge = screen.getByText('high')
    expect(badge.className).toContain('bg-orange-500')
  })

  it('renders "medium" priority badge with blue classes', () => {
    render(<TaskCard task={makeTask({ priority: 'medium' })} zones={ZONES} />)
    const badge = screen.getByText('medium')
    expect(badge.className).toContain('bg-blue-500/20')
  })

  it('renders "low" priority badge with zinc classes', () => {
    render(<TaskCard task={makeTask({ priority: 'low' })} zones={ZONES} />)
    const badge = screen.getByText('low')
    expect(badge.className).toContain('bg-zinc-800')
  })

  it('renders status as "in progress" (underscore replaced)', () => {
    render(<TaskCard task={makeTask({ status: 'in_progress' })} zones={ZONES} />)
    expect(screen.getByText('in progress')).toBeInTheDocument()
  })

  it('renders "completed" status', () => {
    render(<TaskCard task={makeTask({ status: 'completed' })} zones={ZONES} />)
    expect(screen.getByText('completed')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// MatchScoreboard
// ─────────────────────────────────────────────────────────────────────────────
describe('MatchScoreboard', () => {
  it('renders home/away team names and score', () => {
    render(<MatchScoreboard />)
    expect(screen.getByText('Mexico')).toBeInTheDocument()
    expect(screen.getByText('USA')).toBeInTheDocument()
    expect(screen.getByText('2 — 1')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// BroadcastForm
// ─────────────────────────────────────────────────────────────────────────────
describe('BroadcastForm', () => {
  const MOCK_ZONES_STAFF = [
    { id: 'z1', name: 'Gate A', capacity: 1000, current_occupancy: 300, status: 'open' as const },
    { id: 'z2', name: 'Gate B', capacity: 1200, current_occupancy: 500, status: 'crowded' as const },
  ]

  it('submit is disabled until description is filled, and calls broadcastAlert with correct payload', async () => {
    const broadcastAlert = vi.fn().mockResolvedValue(undefined)
    render(<BroadcastForm zones={MOCK_ZONES_STAFF} broadcastAlert={broadcastAlert} />)

    const submitBtn = screen.getByRole('button', { name: /Broadcast alert message to all staff/i })
    expect(submitBtn).toBeDisabled()

    const textarea = screen.getByPlaceholderText(/Enter details of incident/i)
    fireEvent.change(textarea, { target: { value: 'Critical congestion at Gate A' } })
    expect(submitBtn).not.toBeDisabled()

    const severitySelect = screen.getByLabelText(/Severity Level/i)
    fireEvent.change(severitySelect, { target: { value: 'critical' } })

    const zoneSelect = screen.getByLabelText(/Target Zone/i)
    fireEvent.change(zoneSelect, { target: { value: 'z1' } })

    await act(async () => {
      fireEvent.submit(screen.getByLabelText(/Broadcast alert form/i))
    })

    expect(broadcastAlert).toHaveBeenCalledWith('Critical congestion at Gate A', 'critical', 'z1')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// ZoneStatusTable
// ─────────────────────────────────────────────────────────────────────────────
describe('ZoneStatusTable', () => {
  const MOCK_ZONES_STAFF = [
    { id: 'z1', name: 'Gate A', capacity: 1000, current_occupancy: 300, status: 'open' as const },
    { id: 'z2', name: 'Gate B', capacity: 1200, current_occupancy: 500, status: 'crowded' as const },
  ]

  it('renders one row per zone, status select has correct current value, calls updateZoneStatus on change', () => {
    const updateZoneStatus = vi.fn().mockResolvedValue(undefined)
    render(<ZoneStatusTable zones={MOCK_ZONES_STAFF} updateZoneStatus={updateZoneStatus} />)

    expect(screen.getByText('Gate A')).toBeInTheDocument()
    expect(screen.getByText('Gate B')).toBeInTheDocument()

    const selectA = screen.getByLabelText('Change status for Gate A') as HTMLSelectElement
    expect(selectA.value).toBe('open')

    const selectB = screen.getByLabelText('Change status for Gate B') as HTMLSelectElement
    expect(selectB.value).toBe('crowded')

    fireEvent.change(selectA, { target: { value: 'closed' } })
    expect(updateZoneStatus).toHaveBeenCalledWith('z1', 'closed')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// RouteAlerts
// ─────────────────────────────────────────────────────────────────────────────
describe('RouteAlerts', () => {
  it('renders congestion warning when present, renders nothing when warning is null', () => {
    const { rerender } = render(<RouteAlerts congestionWarning="High delay at Gate A" accessibilityNote={null} />)
    expect(screen.getByText('CONGESTION WARNING')).toBeInTheDocument()
    expect(screen.getByText('High delay at Gate A')).toBeInTheDocument()

    rerender(<RouteAlerts congestionWarning={null} accessibilityNote={null} />)
    expect(screen.queryByText('CONGESTION WARNING')).not.toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SpatialPathBreakdown
// ─────────────────────────────────────────────────────────────────────────────
describe('SpatialPathBreakdown', () => {
  it('renders numbered steps in order', () => {
    render(
      <SpatialPathBreakdown
        pathNames={['Gate A', 'Concourse East', 'Section 102']}
        path={['z1', 'z2', 'z3']}
        congestedZones={['z2']}
      />
    )

    expect(screen.getByText('Gate A')).toBeInTheDocument()
    expect(screen.getByText('Concourse East')).toBeInTheDocument()
    expect(screen.getByText('Section 102')).toBeInTheDocument()

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()

    expect(screen.getByText('Congested')).toBeInTheDocument()
  })

  it('renders null when pathNames is empty or undefined', () => {
    const { container } = render(<SpatialPathBreakdown />)
    expect(container.firstChild).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PAAnnouncementPanel
// ─────────────────────────────────────────────────────────────────────────────
describe('PAAnnouncementPanel', () => {
  it('copy button copies announcement text to clipboard', async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextSpy,
      },
      writable: true,
      configurable: true,
    })

    render(<PAAnnouncementPanel announcement="Attention spectators, please proceed to Gate A" language="en" />)
    expect(screen.getByText(/Attention spectators/)).toBeInTheDocument()

    const copyBtn = screen.getByRole('button', { name: /Copy/i })
    await act(async () => {
      fireEvent.click(copyBtn)
    })

    expect(writeTextSpy).toHaveBeenCalledWith('Attention spectators, please proceed to Gate A')
    expect(screen.getByText(/Copied!/)).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// AppShell
// ─────────────────────────────────────────────────────────────────────────────
describe('AppShell', () => {
  it('renders children and displays profile name/role', async () => {
    render(
      <AppShell title="Dashboard">
        <div>Shell Content</div>
      </AppShell>
    )

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(screen.getByText('Shell Content')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('staff')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// LiveAlertsFeed
// ─────────────────────────────────────────────────────────────────────────────
describe('LiveAlertsFeed', () => {
  it('renders nothing when activeAlerts is empty', () => {
    const { container } = render(<LiveAlertsFeed activeAlerts={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders incoming live operational broadcasts when activeAlerts is populated', () => {
    const alerts = [
      { id: 'a1', severity: 'critical' as const, description: 'Medical alert at Gate A', created_at: '2026-07-19T09:00:00Z' },
      { id: 'a2', severity: 'high' as const, description: 'Crowd building at Gate B', created_at: '2026-07-19T09:01:00Z' },
    ]
    render(<LiveAlertsFeed activeAlerts={alerts} />)
    expect(screen.getByText('Incoming Live Operational Broadcasts')).toBeInTheDocument()
    expect(screen.getByText('Medical alert at Gate A')).toBeInTheDocument()
    expect(screen.getByText('Crowd building at Gate B')).toBeInTheDocument()
  })
})
