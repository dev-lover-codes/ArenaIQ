import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  buildNavigatePrompt,
  buildChatSystemInstruction,
  buildVolunteerSystemInstruction,
  buildMatchInsightPrompt,
  buildIncidentPrompt
} from './prompts';
import {
  mockNavigateResponse,
  mockChatResponse,
  mockMatchInsightResponse,
  mockIncidentResponse
} from './mockResponses';
import { sanitizeInput, isAllowedValue } from '@/lib/sanitize';

/**
 * Handles generating localized route descriptions with GenAI (Gemini) or mock responses.
 * 
 * @param body - The request payload containing route breakdown data.
 * @param genAI - The GoogleGenerativeAI client instance (or null to use mocks).
 * @param language - The desired output language code.
 * @returns A Promise resolving to the JSON route details response string.
 */
export async function handleNavigate(
  body: Record<string, unknown>,
  genAI: GoogleGenerativeAI | null,
  language: string
): Promise<string> {
  const { startZoneName, endZoneName, pathNames, rawTime, congestedZones, zoneContext } = body as {
    startZoneName?: string;
    endZoneName?: string;
    pathNames?: string[];
    rawTime?: number;
    congestedZones?: string[];
    zoneContext?: unknown;
  };

  if (!startZoneName || !endZoneName || !pathNames || rawTime === undefined || !congestedZones || !zoneContext) {
    throw new Error('Missing parameters for navigation routing.');
  }

  if (!genAI) {
    return mockNavigateResponse(startZoneName, endZoneName, pathNames, rawTime, congestedZones);
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json'
    }
  });

  const prompt = buildNavigatePrompt(startZoneName, endZoneName, pathNames, rawTime, congestedZones, zoneContext, language);
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Processes chat messages, applying system guidelines for fan support or volunteer copilot mode.
 * 
 * @param body - Request payload with message history and active prompt.
 * @param genAI - The GoogleGenerativeAI client instance (or null to use mocks).
 * @param language - Target translation language code.
 * @returns A Promise resolving to the chat reply.
 */
export async function handleChat(
  body: Record<string, unknown>,
  genAI: GoogleGenerativeAI | null,
  language: string
): Promise<string> {
  const { message, history = [], volunteerMode: vm = false } = body as {
    message?: string;
    history?: Array<{ role: string; text: string }>;
    volunteerMode?: boolean;
  };

  if (!message) {
    throw new Error('Message is required.');
  }

  if (!genAI) {
    return mockChatResponse(message, vm, language);
  }

  const systemInstruction = vm
    ? buildVolunteerSystemInstruction(language)
    : buildChatSystemInstruction(language);

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction
  });

  const formattedHistory = history.map((h: { role: string; text: string }) => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.text }]
  }));

  const chat = model.startChat({
    history: formattedHistory,
    generationConfig: {
      maxOutputTokens: vm ? 400 : 250,
      ...(vm ? { responseMimeType: 'application/json' } : {})
    }
  });

  const result = await chat.sendMessage(message);
  return result.response.text();
}

/**
 * Generates match operational predictions and insights between teams.
 * 
 * @param body - Request body containing homeTeam and awayTeam names.
 * @param genAI - The GoogleGenerativeAI client instance (or null to use mocks).
 * @param language - Desired response language code.
 * @returns Promise resolving to operational match preview advice.
 */
export async function handleMatchInsight(
  body: Record<string, unknown>,
  genAI: GoogleGenerativeAI | null,
  language: string
): Promise<string> {
  const { homeTeam, awayTeam } = body as {
    homeTeam?: string;
    awayTeam?: string;
  };

  const cleanHomeTeam = sanitizeInput(homeTeam);
  const cleanAwayTeam = sanitizeInput(awayTeam);
  if (!cleanHomeTeam) {
    throw new Error('homeTeam is required.');
  }
  if (!cleanAwayTeam) {
    throw new Error('awayTeam is required.');
  }

  if (!genAI) {
    return mockMatchInsightResponse(cleanHomeTeam, cleanAwayTeam);
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = buildMatchInsightPrompt(cleanHomeTeam, cleanAwayTeam, language);
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Produces action protocol guidelines when stadium incidents are logged.
 * 
 * @param body - Request payload detailing incident type, location, severity, and description.
 * @param genAI - The GoogleGenerativeAI client instance (or null to use mocks).
 * @param language - Target communication language code.
 * @returns Promise resolving to step-by-step incident response procedures.
 */
export async function handleIncidentResponse(
  body: Record<string, unknown>,
  genAI: GoogleGenerativeAI | null,
  language: string
): Promise<string> {
  const { type, zone, severity, description } = body as {
    type?: string;
    zone?: string;
    severity?: string;
    description?: string;
  };

  if (!type) {
    throw new Error('type is required.');
  }
  if (!zone) {
    throw new Error('zone is required.');
  }
  if (!severity) {
    throw new Error('severity is required.');
  }

  if (!isAllowedValue(type, [
    'Medical Emergency', 'Security Threat', 
    'Crowd Crush Risk', 'Fire/Evacuation', 
    'Lost Person', 'Infrastructure Damage',
    'fire', 'medical', 'crowd_surge', 'security', 'crowd_control', 'evacuation'
  ])) {
    throw new Error('Invalid incident type.');
  }
  if (!isAllowedValue(severity, ['Low', 'Medium', 'High', 'Critical', 'low', 'medium', 'high', 'critical'])) {
    throw new Error('Invalid severity level.');
  }
  const cleanDescription = description ? sanitizeInput(description, 500) : null;
  if (description && !cleanDescription) {
    throw new Error('description exceeds 500 characters.');
  }

  if (!genAI) {
    return mockIncidentResponse(type, zone, severity);
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = buildIncidentPrompt(type, zone, severity, cleanDescription, language);
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * General-purpose dispatcher to run arbitrary prompts against Gemini or fallback mock responses.
 * 
 * @param body - Request payload with the raw prompt and optional model parameter.
 * @param genAI - The GoogleGenerativeAI client instance (or null to use mocks).
 * @returns Promise resolving to text output from Gemini model.
 */
export async function handleGenericPrompt(
  body: Record<string, unknown>,
  genAI: GoogleGenerativeAI | null
): Promise<string> {
  const { prompt, model: modelName } = body as {
    prompt?: string;
    model?: string;
  };

  if (!prompt) {
    throw new Error('Prompt is required.');
  }
  if (!genAI) {
    return `[Mock AI Response] ${prompt}`;
  }
  const modelInstance = genAI.getGenerativeModel({ model: modelName || 'gemini-1.5-flash' });
  const result = await modelInstance.generateContent(prompt);
  return result.response.text();
}
