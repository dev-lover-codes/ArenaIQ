import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import {
  handleNavigate,
  handleChat,
  handleMatchInsight,
  handleIncidentResponse,
  handleGenericPrompt,
} from '@/lib/gemini/handlers';

const getAllowedOrigin = () =>
  process.env.NEXT_PUBLIC_SITE_URL || 'https://arenaiq.vercel.app';

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': getAllowedOrigin(),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// eslint-disable-next-line complexity -- Complexity is inherent due to request validation and action dispatching to specific handlers.
export async function POST(request: Request): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for') ?? 
    request.headers.get('x-real-ip') ?? 'unknown';
  if (!checkRateLimit(ip, 20, 60_000)) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please wait.' },
      { status: 429 }
    );
  }

  // Tighten origin check. Note: We intentionally allow requests when the origin header is
  // null/omitted because same-origin browser requests often omit the Origin header on simple
  // requests, and server-to-server calls have no origin. This is not an oversight.
  const origin = request.headers.get('origin');
  const allowedOrigin = getAllowedOrigin();
  if (origin && origin !== allowedOrigin) {
    return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { action, language = 'en' } = body;

    if (body.prompt && typeof body.prompt === 'string' && body.prompt.length > 2000) {
      return NextResponse.json({ success: false, error: 'Prompt over 2000 chars.' }, { status: 400 });
    }
    if (body.message && typeof body.message === 'string' && body.message.length > 2000) {
      return NextResponse.json({ success: false, error: 'Message over 2000 chars.' }, { status: 400 });
    }

    const hasPromptOrModel = ('prompt' in body) || ('model' in body) || (!action);
    if (hasPromptOrModel) {
      if (!body.prompt) return NextResponse.json({ success: false, error: 'Prompt is required.' }, { status: 400 });
      if (!body.model) return NextResponse.json({ success: false, error: 'Model is required.' }, { status: 400 });
    }

    // Dynamically import the SDK only when we actually need to call Gemini,
    // so cold-start / mock-branch requests don't pay the import cost.
    const geminiApiKey = process.env.GEMINI_API_KEY;
    let genAI = null;
    if (geminiApiKey && geminiApiKey !== 'dummy-key') {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      genAI = new GoogleGenerativeAI(geminiApiKey);
    }

    let text = '';
    if (!action && body.prompt) {
      text = await handleGenericPrompt(body, genAI);
    } else {
      switch (action) {
        case 'navigate':
          text = await handleNavigate(body, genAI, language);
          break;
        case 'chat':
          text = await handleChat(body, genAI, language);
          break;
        case 'match_insight':
          text = await handleMatchInsight(body, genAI, language);
          break;
        case 'incident_response':
          text = await handleIncidentResponse(body, genAI, language);
          break;
        default:
          return NextResponse.json({ success: false, error: 'Unknown action type.' }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, text });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown Gemini API error';
    const isValidation = errorMsg.includes('required') || errorMsg.includes('Invalid') || errorMsg.includes('exceeds') || errorMsg.includes('Missing');
    return NextResponse.json({ success: false, error: errorMsg }, { status: isValidation ? 400 : 500 });
  }
}
