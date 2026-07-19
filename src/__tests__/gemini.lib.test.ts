/**
 * Tests for src/lib/gemini/prompts.ts, mockResponses.ts, and handlers.ts.
 *
 * All handler tests run against genAI=null (mock branch) so no real API key
 * or network call is required. The real-genAI branches are covered at
 * integration / e2e level.
 */
import { describe, it, expect } from 'vitest'

import {
  buildNavigatePrompt,
  buildChatSystemInstruction,
  buildVolunteerSystemInstruction,
  buildMatchInsightPrompt,
  buildIncidentPrompt,
} from '../lib/gemini/prompts'

import {
  mockNavigateResponse,
  mockChatResponse,
  mockMatchInsightResponse,
  mockIncidentResponse,
} from '../lib/gemini/mockResponses'

import {
  handleNavigate,
  handleChat,
  handleMatchInsight,
  handleIncidentResponse,
  handleGenericPrompt,
} from '../lib/gemini/handlers'

// ─────────────────────────────────────────────────────────────────────────────
// prompts.ts
// ─────────────────────────────────────────────────────────────────────────────

describe('buildNavigatePrompt', () => {
  it('returns a string containing both zone names', () => {
    const result = buildNavigatePrompt('Gate A', 'Section 104', ['Gate A', 'Section 104'], 240, [], {}, 'en')
    expect(typeof result).toBe('string')
    expect(result).toContain('Gate A')
    expect(result).toContain('Section 104')
  })

  it('includes the language directive', () => {
    const result = buildNavigatePrompt('A', 'B', ['A', 'B'], 60, [], {}, 'es')
    expect(result).toContain('es')
  })

  it('includes congested zones in the prompt', () => {
    const result = buildNavigatePrompt('A', 'B', ['A', 'B'], 60, ['Gate C'], {}, 'en')
    expect(result).toContain('Gate C')
  })

  it('converts rawTime to minutes correctly', () => {
    const result = buildNavigatePrompt('A', 'B', ['A', 'B'], 300, [], {}, 'en')
    // 300s = 5 minutes
    expect(result).toContain('5 minutes')
  })
})

describe('buildChatSystemInstruction', () => {
  it('returns a string containing the language', () => {
    const result = buildChatSystemInstruction('fr')
    expect(typeof result).toBe('string')
    expect(result).toContain('fr')
  })

  it('mentions FIFA World Cup 2026', () => {
    expect(buildChatSystemInstruction('en')).toContain('FIFA World Cup 2026')
  })
})

describe('buildVolunteerSystemInstruction', () => {
  it('returns a string containing the language', () => {
    const result = buildVolunteerSystemInstruction('de')
    expect(typeof result).toBe('string')
    expect(result).toContain('de')
  })

  it('mentions urgency levels', () => {
    const result = buildVolunteerSystemInstruction('en')
    expect(result).toContain('LOW')
    expect(result).toContain('CRITICAL')
  })
})

describe('buildMatchInsightPrompt', () => {
  it('includes both team names and language', () => {
    const result = buildMatchInsightPrompt('Brazil', 'Argentina', 'pt')
    expect(result).toContain('Brazil')
    expect(result).toContain('Argentina')
    expect(result).toContain('pt')
  })
})

describe('buildIncidentPrompt', () => {
  it('includes type, zone, severity, and language', () => {
    const result = buildIncidentPrompt('Fire/Evacuation', 'Gate B', 'High', 'Smoke detected', 'en')
    expect(result).toContain('Fire/Evacuation')
    expect(result).toContain('Gate B')
    expect(result).toContain('High')
    expect(result).toContain('Smoke detected')
    expect(result).toContain('en')
  })

  it('uses fallback text when description is null', () => {
    const result = buildIncidentPrompt('fire', 'Zone 1', 'Low', null, 'en')
    expect(result).toContain('No additional details.')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// mockResponses.ts
// ─────────────────────────────────────────────────────────────────────────────

describe('mockNavigateResponse', () => {
  it('returns valid JSON', () => {
    const raw = mockNavigateResponse('Gate A', 'Section 104', ['Gate A', 'Concourse', 'Section 104'], 180, [])
    expect(() => JSON.parse(raw)).not.toThrow()
  })

  it('starts with startZoneName and ends with endZoneName', () => {
    const parsed = JSON.parse(
      mockNavigateResponse('Gate A', 'Section 104', ['Gate A', 'Concourse', 'Section 104'], 180, [])
    )
    expect(parsed.steps[0]).toContain('Gate A')
    expect(parsed.steps[parsed.steps.length - 1]).toContain('Section 104')
  })

  it('sets urgency to high when congested zones exist', () => {
    const parsed = JSON.parse(
      mockNavigateResponse('A', 'B', ['A', 'B'], 60, ['Gate C'])
    )
    expect(parsed.urgency).toBe('high')
    expect(parsed.congestion_warning).toContain('Gate C')
  })

  it('sets urgency to low when no congested zones', () => {
    const parsed = JSON.parse(
      mockNavigateResponse('A', 'B', ['A', 'B'], 60, [])
    )
    expect(parsed.urgency).toBe('low')
    expect(parsed.congestion_warning).toBeNull()
  })

  it('uses at least 1 minute when rawTime rounds to 0', () => {
    const parsed = JSON.parse(
      mockNavigateResponse('A', 'B', ['A', 'B'], 0, [])
    )
    expect(parsed.estimated_minutes).toBe(1)
  })

  it('includes intermediate path nodes', () => {
    const parsed = JSON.parse(
      mockNavigateResponse('A', 'D', ['A', 'B', 'C', 'D'], 120, [])
    )
    expect(parsed.steps.some((s: string) => s.includes('B'))).toBe(true)
    expect(parsed.steps.some((s: string) => s.includes('C'))).toBe(true)
  })
})

describe('mockChatResponse', () => {
  it('returns a plain string in fan mode', () => {
    const result = mockChatResponse('Where is the bathroom?', false, 'en')
    expect(typeof result).toBe('string')
    expect(result).toContain('Where is the bathroom?')
    expect(result).toContain('EN')
  })

  it('returns valid JSON in volunteer mode', () => {
    const raw = mockChatResponse('Fan is lost', true, 'en')
    expect(() => JSON.parse(raw)).not.toThrow()
    const parsed = JSON.parse(raw)
    expect(parsed).toHaveProperty('response')
    expect(parsed).toHaveProperty('urgency', 'LOW')
    expect(parsed).toHaveProperty('escalate', false)
  })

  it('includes the message in volunteer mode response', () => {
    const parsed = JSON.parse(mockChatResponse('test message', true, 'en'))
    expect(parsed.response).toContain('test message')
  })
})

describe('mockMatchInsightResponse', () => {
  it('includes both team names', () => {
    const result = mockMatchInsightResponse('France', 'Germany')
    expect(result).toContain('France')
    expect(result).toContain('Germany')
  })
})

describe('mockIncidentResponse', () => {
  it('includes type, zone, and severity', () => {
    const result = mockIncidentResponse('Medical Emergency', 'Gate B', 'High')
    expect(result).toContain('Medical Emergency')
    expect(result).toContain('Gate B')
    expect(result).toContain('High')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// handlers.ts — mock branch (genAI = null)
// ─────────────────────────────────────────────────────────────────────────────

describe('handleNavigate — mock branch', () => {
  const base = {
    startZoneName: 'Gate A',
    endZoneName: 'Section 104',
    pathNames: ['Gate A', 'Section 104'],
    rawTime: 180,
    congestedZones: [],
    zoneContext: { 'Gate A': 'open' },
  }

  it('returns a JSON string when genAI is null', async () => {
    const result = await handleNavigate(base, null, 'en')
    expect(() => JSON.parse(result)).not.toThrow()
  })

  it('throws when required params are missing', async () => {
    await expect(handleNavigate({}, null, 'en')).rejects.toThrow('Missing parameters')
  })

  it('throws when startZoneName is missing', async () => {
    const { startZoneName: _, ...rest } = base
    await expect(handleNavigate(rest, null, 'en')).rejects.toThrow()
  })
})

describe('handleChat — mock branch', () => {
  it('returns a string when genAI is null', async () => {
    const result = await handleChat({ message: 'hello' }, null, 'en')
    expect(typeof result).toBe('string')
  })

  it('throws when message is missing', async () => {
    await expect(handleChat({}, null, 'en')).rejects.toThrow('Message is required')
  })

  it('returns volunteer JSON when volunteerMode is true', async () => {
    const raw = await handleChat({ message: 'fan needs help', volunteerMode: true }, null, 'en')
    expect(() => JSON.parse(raw)).not.toThrow()
  })

  it('passes chat history without throwing', async () => {
    const history = [{ role: 'user', text: 'hi' }, { role: 'model', text: 'hello' }]
    const result = await handleChat({ message: 'test', history }, null, 'en')
    expect(typeof result).toBe('string')
  })
})

describe('handleMatchInsight — mock branch', () => {
  it('returns a string with both team names', async () => {
    const result = await handleMatchInsight({ homeTeam: 'Brazil', awayTeam: 'Argentina' }, null, 'en')
    expect(result).toContain('Brazil')
    expect(result).toContain('Argentina')
  })

  it('throws when homeTeam is missing', async () => {
    await expect(handleMatchInsight({ awayTeam: 'Germany' }, null, 'en')).rejects.toThrow('homeTeam')
  })

  it('throws when awayTeam is missing', async () => {
    await expect(handleMatchInsight({ homeTeam: 'France' }, null, 'en')).rejects.toThrow('awayTeam')
  })

  it('throws when homeTeam is an empty string', async () => {
    await expect(handleMatchInsight({ homeTeam: '', awayTeam: 'Spain' }, null, 'en')).rejects.toThrow()
  })
})

describe('handleIncidentResponse — mock branch', () => {
  const base = { type: 'Medical Emergency', zone: 'Gate B', severity: 'High' }

  it('returns a string with type, zone, severity', async () => {
    const result = await handleIncidentResponse(base, null, 'en')
    expect(result).toContain('Medical Emergency')
    expect(result).toContain('Gate B')
    expect(result).toContain('High')
  })

  it('throws when type is missing', async () => {
    const { type: _, ...rest } = base
    await expect(handleIncidentResponse(rest, null, 'en')).rejects.toThrow('type is required')
  })

  it('throws when zone is missing', async () => {
    const { zone: _, ...rest } = base
    await expect(handleIncidentResponse(rest, null, 'en')).rejects.toThrow('zone is required')
  })

  it('throws when severity is missing', async () => {
    const { severity: _, ...rest } = base
    await expect(handleIncidentResponse(rest, null, 'en')).rejects.toThrow('severity is required')
  })

  it('throws when type is not in allowed list', async () => {
    await expect(handleIncidentResponse({ ...base, type: 'Zombie Attack' }, null, 'en'))
      .rejects.toThrow('Invalid incident type')
  })

  it('throws when severity is not in allowed list', async () => {
    await expect(handleIncidentResponse({ ...base, severity: 'Extreme' }, null, 'en'))
      .rejects.toThrow('Invalid severity level')
  })

  it('accepts a valid description', async () => {
    const result = await handleIncidentResponse({ ...base, description: 'Fan collapsed' }, null, 'en')
    expect(typeof result).toBe('string')
  })

  it('throws when description exceeds 500 characters', async () => {
    await expect(handleIncidentResponse(
      { ...base, description: 'x'.repeat(501) }, null, 'en'
    )).rejects.toThrow('description exceeds')
  })
})

describe('handleGenericPrompt — mock branch', () => {
  it('returns a mock string when genAI is null', async () => {
    const result = await handleGenericPrompt({ prompt: 'hello', model: 'gemini-1.5-flash' }, null)
    expect(result).toContain('hello')
    expect(result).toContain('[Mock AI Response]')
  })

  it('throws when prompt is missing', async () => {
    await expect(handleGenericPrompt({ model: 'gemini-1.5-flash' }, null)).rejects.toThrow('Prompt is required')
  })
})
