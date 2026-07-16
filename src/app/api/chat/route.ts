import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeInput } from '@/lib/sanitize'

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { message, sessionId, language = 'en', volunteerMode = false } = await request.json()

    const cleanMessage = sanitizeInput(message, 2000)
    if (!cleanMessage) {
      return NextResponse.json({ success: false, error: 'Message is required.' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Get authenticated user
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized user session.' }, { status: 401 })
    }

    // 2. Fetch or create chat session
    let messagesList: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = []
    let activeSessionId = sessionId

    if (activeSessionId) {
      const { data: sessionData, error: sessionErr } = await supabase
        .from('chat_sessions')
        .select('messages')
        .eq('id', activeSessionId)
        .single()

      if (!sessionErr && sessionData) {
        messagesList = sessionData.messages || []
      }
    }

    // Append new user message in the correct format for Gemini's history:
    // { role: "user" | "model", parts: [{ text: "..." }] }
    const newUserMsg = { role: 'user' as const, parts: [{ text: cleanMessage }] }
    messagesList.push(newUserMsg)

    // 3. Call centralized /api/gemini
    let assistantReply = ''
    try {
      const origin = new URL(request.url).origin
      
      // Map message history to simple objects for Gemini gateway
      const history = messagesList.slice(0, -1).map((m) => ({
        role: m.role,
        text: m.parts?.[0]?.text || ''
      }))

      const geminiRes = await fetch(`${origin}/api/gemini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          language,
          message: cleanMessage,
          history,
          volunteerMode,
        })
      })

      const geminiData = await geminiRes.json()
      if (geminiData.success) {
        assistantReply = geminiData.text
      } else {
        throw new Error(geminiData.error || 'Gemini error')
      }
    } catch (err) {
      console.error('Chat API Error:', err)
      assistantReply = `[AI Assistant - ${language.toUpperCase()}] I received your query: "${cleanMessage}". Let me know if you need directions or crowd status updates!`
    }

    // Append model reply to messages list
    const newModelMsg = { role: 'model' as const, parts: [{ text: assistantReply }] }
    messagesList.push(newModelMsg)

    // 4. Save to Database
    if (activeSessionId) {
      const { error: saveErr } = await supabase
        .from('chat_sessions')
        .update({
          messages: messagesList,
          language,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeSessionId)

      if (saveErr) throw saveErr
    } else {
      const { data: newSession, error: createErr } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          messages: messagesList,
          language,
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (createErr) throw createErr
      activeSessionId = newSession.id
    }

    return NextResponse.json({
      success: true,
      sessionId: activeSessionId,
      messages: messagesList.map((m) => ({
        role: m.role,
        text: m.parts[0].text
      }))
    })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown server-side error'
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 })
  }
}
