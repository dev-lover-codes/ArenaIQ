import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, language = 'en' } = body

    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey || geminiApiKey === 'dummy-key') {
      // Fallback/Mock response for local development without key
      if (action === 'navigate') {
        const { startZoneName, endZoneName, pathNames, rawTime, congestedZones } = body
        const desc = `[Mock AI Route Guide - ${language.toUpperCase()}] To travel from ${startZoneName} to ${endZoneName}, proceed along: ${pathNames.join(' → ')}. Physical walking time is ${Math.round(rawTime / 60)} minutes. ${congestedZones.length > 0 ? `Alert: ${congestedZones.join(', ')} is currently crowded. Plan accordingly.` : 'The path is currently clear.'}`
        return NextResponse.json({ success: true, text: desc })
      } else if (action === 'chat') {
        const { message } = body
        const desc = `[Mock AI Assistant - ${language.toUpperCase()}] I received your message: "${message}". I can help with stadium schedules, concessions, and navigation. Let me know if you need assistance!`
        return NextResponse.json({ success: true, text: desc })
      }
      return NextResponse.json({ success: false, error: 'Unknown action type.' }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey)

    if (action === 'navigate') {
      const { startZoneName, endZoneName, pathNames, rawTime, totalTime, congestedZones, zoneContext } = body

      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: 'You are StadiumIQ, the official FIFA World Cup 2026 smart assistant. Answer fan navigation queries based strictly on pre-computed graph paths. Warn them about crowd density and explain walk times. Do NOT invent routes or zones.'
      })

      const prompt = `Explain this optimal walk route from "${startZoneName}" to "${endZoneName}" in "${language}".
Route breakdown:
- Path: ${pathNames.join(' -> ')}
- Physical walk time: ${Math.round(rawTime)} seconds
- Weighted travel time (accounting for crowd delay): ${Math.round(totalTime)} seconds
- Crowded/congested zones: ${congestedZones.join(', ') || 'None'}

Current stadium zone occupancy context:
${JSON.stringify(zoneContext, null, 2)}

Provide a friendly, concise, step-by-step description of this path. Mention the estimated walk time and flag any congested zones to watch out for. Write strictly in "${language}". Keep it under 150 words.`

      const result = await model.generateContent(prompt)
      return NextResponse.json({ success: true, text: result.response.text() })
    }

    if (action === 'chat') {
      const { message, history = [] } = body

      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: `You are StadiumIQ, the official FIFA World Cup 2026 smart assistant. Answer fan questions about the stadium, match schedule, facilities, rules, and navigation. Respond in ${language}. Be concise and helpful. Refuse to answer non-stadium/non-sports queries politely: 'I can only assist with World Cup stadium operations, facilities, concessions, schedules, and navigation.'`
      })

      // Convert history to Gemini format: array of { role: 'user'|'model', parts: [{ text: string }] }
      const formattedHistory = history.map((h: { role: string; text: string }) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      }))

      const chat = model.startChat({
        history: formattedHistory,
        generationConfig: {
          maxOutputTokens: 250,
        }
      })

      const result = await chat.sendMessage(message)
      return NextResponse.json({ success: true, text: result.response.text() })
    }

    return NextResponse.json({ success: false, error: 'Invalid action parameter.' }, { status: 400 })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown Gemini API error'
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 })
  }
}
