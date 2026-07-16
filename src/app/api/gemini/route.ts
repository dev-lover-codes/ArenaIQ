import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { sanitizeInput, isAllowedValue } from '@/lib/sanitize'
import { checkRateLimit } from '@/lib/rateLimit'

const getAllowedOrigin = () =>
  process.env.NEXT_PUBLIC_SITE_URL || 'https://arenaiq.vercel.app'

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': getAllowedOrigin(),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(request: Request): Promise<NextResponse> {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') ?? 
    request.headers.get('x-real-ip') ?? 'unknown'
  if (!checkRateLimit(ip, 20, 60_000)) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please wait.' },
      { status: 429 }
    )
  }

  const origin = request.headers.get('origin')
  const allowedOrigin = getAllowedOrigin()
  // Block cross-origin requests from unknown origins (allow null/same-origin server-to-server calls)
  if (origin && origin !== allowedOrigin) {
    return NextResponse.json(
      { success: false, error: 'Forbidden.' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { action, language = 'en' } = body

    // Validation for prompt/message character length limits
    if (body.prompt && typeof body.prompt === 'string' && body.prompt.length > 2000) {
      return NextResponse.json({ success: false, error: 'Prompt over 2000 chars.' }, { status: 400 })
    }
    if (body.message && typeof body.message === 'string' && body.message.length > 2000) {
      return NextResponse.json({ success: false, error: 'Message over 2000 chars.' }, { status: 400 })
    }

    const hasPromptOrModel = ('prompt' in body) || ('model' in body) || (!body.action)
    if (hasPromptOrModel) {
      if (!body.prompt) {
        return NextResponse.json({ success: false, error: 'Prompt is required.' }, { status: 400 })
      }
      if (!body.model) {
        return NextResponse.json({ success: false, error: 'Model is required.' }, { status: 400 })
      }
    }

    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey || geminiApiKey === 'dummy-key') {
      // Fallback/Mock response for local development without key
      if (body.prompt) {
        return NextResponse.json({ success: true, text: `[Mock AI Response] ${body.prompt}` })
      }
      if (action === 'navigate') {
        const { startZoneName, endZoneName, pathNames, rawTime, congestedZones } = body
        const mockJson = {
          steps: [
            `Start at ${startZoneName}`,
            ...pathNames.slice(1, -1).map((p: string) => `Pass through ${p}`),
            `Arrive at ${endZoneName}`
          ],
          estimated_minutes: Math.round(rawTime / 60) || 1,
          congestion_warning: congestedZones.length > 0 ? `Warning: ${congestedZones.join(', ')} is congested. Expect delays.` : null,
          urgency: congestedZones.length > 0 ? 'high' : 'low',
          accessibility_note: 'This route is step-free and wheelchair accessible.',
          ai_reasoning: `Recommended path ${pathNames.join(' → ')} based on optimal pre-computed routing.`
        }
        return NextResponse.json({ success: true, text: JSON.stringify(mockJson) })
      } else if (action === 'chat') {
        const { message, volunteerMode: vm } = body
        if (vm) {
          const mockCopilot = JSON.stringify({
            response: `[Volunteer Co-pilot] Received: "${message}". Fan query acknowledged. Please check zone density and respond calmly.`,
            announcement: `Attention stadium guests in your zone: assistance is available. Please remain calm and follow volunteer instructions.`,
            urgency: 'LOW',
            escalate: false,
            reason: 'Mock response — no real AI key configured'
          })
          return NextResponse.json({ success: true, text: mockCopilot })
        }
        const desc = `[Mock AI Assistant - ${language.toUpperCase()}] I received your message: "${message}". I can help with stadium schedules, concessions, and navigation. Need anything else? 🏟️`
        return NextResponse.json({ success: true, text: desc })
      } else if (action === 'match_insight') {
        const { homeTeam, awayTeam } = body
        if (!homeTeam) return NextResponse.json({ success: false, error: 'homeTeam is required.' }, { status: 400 })
        if (!awayTeam) return NextResponse.json({ success: false, error: 'awayTeam is required.' }, { status: 400 })
        return NextResponse.json({ success: true, text: `[Mock Insight] ${homeTeam} vs ${awayTeam} — Tactical preview coming soon.` })
      } else if (action === 'incident_response') {
        const { type, zone, severity, description } = body
        if (!type) return NextResponse.json({ success: false, error: 'type is required.' }, { status: 400 })
        if (!zone) return NextResponse.json({ success: false, error: 'zone is required.' }, { status: 400 })
        if (!severity) return NextResponse.json({ success: false, error: 'severity is required.' }, { status: 400 })
        if (description && typeof description === 'string' && description.length > 500) {
          return NextResponse.json({ success: false, error: 'description exceeds 500 characters.' }, { status: 400 })
        }
        return NextResponse.json({ success: true, text: `[Mock Protocol] 5-step response for ${type} incident at ${zone} (${severity}).` })
      }
      return NextResponse.json({ success: false, error: 'Unknown action type.' }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey)

    if (!action && body.prompt) {
      const model = genAI.getGenerativeModel({ model: body.model || 'gemini-1.5-flash' })
      const result = await model.generateContent(body.prompt)
      return NextResponse.json({ success: true, text: result.response.text() })
    }

    if (action === 'navigate') {
      const { startZoneName, endZoneName, pathNames, rawTime, congestedZones, zoneContext } = body

      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })

      const prompt = `You are ArenaIQ, the FIFA World Cup 2026 stadium AI. Analyze this navigation request and respond ONLY in valid JSON.

CONTEXT:
- Fan location: "${startZoneName}"
- Destination: "${endZoneName}"  
- Language preference: "${language}"
- Pre-computed optimal path: ${JSON.stringify(pathNames)}
- Physical walk time: ${Math.round(rawTime / 60)} minutes
- Congested zones on path: ${JSON.stringify(congestedZones)}
- All zone statuses: ${JSON.stringify(zoneContext)}

FEW-SHOT EXAMPLES (follow this format exactly):

Example 1 Input: Gate A → Section 102, path clear
Example 1 Output:
{
  "steps": ["Exit Gate A through the main turnstile", "Follow the green signs to Level 1 Concourse", "Turn right at Concession Stand B", "Section 102 is on your left"],
  "estimated_minutes": 4,
  "congestion_warning": null,
  "urgency": "low",
  "accessibility_note": "This route is step-free and wheelchair accessible",
  "ai_reasoning": "Selected this path because all zones are open and it minimizes walking distance"
}

Example 2 Input: Gate C → Section 204, Gate C at 87% capacity
Example 2 Output:
{
  "steps": ["Avoid the main Gate C entrance — currently at 87% capacity", "Use the alternate Gate C2 side entrance", "Take elevator to Level 2", "Section 204 is straight ahead"],
  "estimated_minutes": 7,
  "congestion_warning": "Gate C is near critical capacity. Expect 3-4 minute delay.",
  "urgency": "high",
  "accessibility_note": "Elevator available at Gate C2 for wheelchair users",
  "ai_reasoning": "Rerouted through Gate C2 to avoid crush risk at main entrance"
}

Now generate the navigation response for the actual fan above.
Respond ONLY in JSON matching the example format. Language for step text: "${language}".`

      const result = await model.generateContent(prompt)
      return NextResponse.json({ success: true, text: result.response.text() })
    }

    if (action === 'chat') {
      const { message, history = [], volunteerMode: vm = false } = body

      const volunteerSystemInstruction = `You are ArenaIQ co-pilot for a FIFA World Cup 2026 volunteer. The volunteer is managing a zone with potentially 4,000 fans. Help them:
- Answer multilingual fan queries
- Generate crowd announcements to read aloud
- Identify urgency levels (LOW/MEDIUM/HIGH/CRITICAL)
- Suggest when to escalate to security

For each response, output ONLY valid JSON in this exact format (no prose outside the JSON):
{
  "response": "text to say to the fan (in ${language})",
  "announcement": "optional PA announcement text (in ${language}, or null if not needed)",
  "urgency": "LOW|MEDIUM|HIGH|CRITICAL",
  "escalate": true|false,
  "reason": "brief explanation of urgency level"
}

URGENCY GUIDELINES:
- LOW: routine questions (directions, facilities, schedules)
- MEDIUM: mild distress, lost children (not yet found), minor conflicts
- HIGH: medical symptoms, aggressive behaviour, large lost group
- CRITICAL: medical emergency, fight, security threat, crush risk`

      const standardSystemInstruction = `You are ArenaIQ, the official FIFA World Cup 2026 AI assistant. You ONLY answer questions about: stadium navigation, match schedules, facilities, food, security, medical, and accessibility. You detect urgency in tone.

FEW-SHOT BEHAVIOR EXAMPLES:
- User: "where bathroom" → Brief, direct directions
- User: "I NEED BATHROOM NOW medical emergency" → Respond with urgency, include medical station location
- User: "donde está la salida" → Respond in Spanish
- User: "i'm lost and scared" → Calm, reassuring tone first, then directions

For non-stadium queries respond: "I can only assist with FIFA World Cup 2026 stadium operations. How can I help you navigate?"

Always respond in: ${language}
Always end with: "Need anything else? 🏟️"`

      const systemInstruction = vm ? volunteerSystemInstruction : standardSystemInstruction

      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction
      })

      // Convert history to Gemini format: array of { role: 'user'|'model', parts: [{ text: string }] }
      const formattedHistory = history.map((h: { role: string; text: string }) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      }))

      const chat = model.startChat({
        history: formattedHistory,
        generationConfig: {
          maxOutputTokens: vm ? 400 : 250,
          ...(vm ? { responseMimeType: 'application/json' } : {})
        }
      })

      const result = await chat.sendMessage(message)
      return NextResponse.json({ success: true, text: result.response.text() })
    }

    if (action === 'match_insight') {
      const { homeTeam, awayTeam } = body
      const cleanHomeTeam = sanitizeInput(homeTeam)
      const cleanAwayTeam = sanitizeInput(awayTeam)
      if (!cleanHomeTeam) {
        return NextResponse.json({ success: false, error: 'homeTeam is required.' }, { status: 400 })
      }
      if (!cleanAwayTeam) {
        return NextResponse.json({ success: false, error: 'awayTeam is required.' }, { status: 400 })
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const prompt = `You are ArenaIQ tactical analyst for FIFA World Cup 2026. Provide a concise pre-match tactical insight for ${cleanHomeTeam} vs ${cleanAwayTeam}. Include: key players to watch, formation battle, and one bold prediction. Language: ${language}.`
      const result = await model.generateContent(prompt)
      return NextResponse.json({ success: true, text: result.response.text() })
    }

    if (action === 'incident_response') {
      const { type, zone, severity, description } = body
      if (!type) {
        return NextResponse.json({ success: false, error: 'type is required.' }, { status: 400 })
      }
      if (!zone) {
        return NextResponse.json({ success: false, error: 'zone is required.' }, { status: 400 })
      }
      if (!severity) {
        return NextResponse.json({ success: false, error: 'severity is required.' }, { status: 400 })
      }
      if (!isAllowedValue(type, [
        'Medical Emergency', 'Security Threat', 
        'Crowd Crush Risk', 'Fire/Evacuation', 
        'Lost Person', 'Infrastructure Damage',
        // Also allow shorter variants used in tests
        'fire', 'medical', 'crowd_surge', 'security', 'crowd_control', 'evacuation'
      ])) {
        return NextResponse.json({ success: false, error: 'Invalid incident type.' }, { status: 400 })
      }
      if (!isAllowedValue(severity, ['Low', 'Medium', 'High', 'Critical', 'low', 'medium', 'high', 'critical'])) {
        return NextResponse.json({ success: false, error: 'Invalid severity level.' }, { status: 400 })
      }
      const cleanDescription = description ? sanitizeInput(description, 500) : null
      if (description && !cleanDescription) {
        return NextResponse.json({ success: false, error: 'description exceeds 500 characters.' }, { status: 400 })
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const prompt = `You are ArenaIQ incident coordinator for FIFA World Cup 2026. Generate a clear 5-step response protocol for the following stadium incident:
- Type: ${type}
- Zone: ${zone}
- Severity: ${severity}
- Description: ${cleanDescription || 'No additional details.'}

Respond with exactly 5 numbered actionable steps for stadium staff. Language: ${language}.`
      const result = await model.generateContent(prompt)
      return NextResponse.json({ success: true, text: result.response.text() })
    }

    return NextResponse.json({ success: false, error: 'Invalid action parameter.' }, { status: 400 })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown Gemini API error'
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 })
  }
}
