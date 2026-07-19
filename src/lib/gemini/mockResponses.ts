/**
 * Generates mock JSON route explanation responses.
 * 
 * @param startZoneName - Name of the departure zone.
 * @param endZoneName - Name of the destination zone.
 * @param pathNames - Array of zone names in the calculated path.
 * @param rawTime - The raw walk time estimate in seconds.
 * @param congestedZones - Array of congested zone names traversed.
 * @returns JSON string representing the structured navigation advice.
 */
export function mockNavigateResponse(
  startZoneName: string,
  endZoneName: string,
  pathNames: string[],
  rawTime: number,
  congestedZones: string[]
) {
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
  };
  return JSON.stringify(mockJson);
}

/**
 * Returns placeholder responses for chat inquiries when Gemini is not connected.
 * 
 * @param message - The raw chat message from the user.
 * @param volunteerMode - If true, returns a structured volunteer co-pilot JSON payload.
 * @param language - Desired reply language.
 * @returns Text or JSON string representing the helper reply.
 */
export function mockChatResponse(message: string, volunteerMode: boolean, language: string) {
  if (volunteerMode) {
    return JSON.stringify({
      response: `[Volunteer Co-pilot] Received: "${message}". Fan query acknowledged. Please check zone density and respond calmly.`,
      announcement: `Attention stadium guests in your zone: assistance is available. Please remain calm and follow volunteer instructions.`,
      urgency: 'LOW',
      escalate: false,
      reason: 'Mock response — no real AI key configured'
    });
  }
  return `[Mock AI Assistant - ${language.toUpperCase()}] I received your message: "${message}". I can help with stadium schedules, concessions, and navigation. Need anything else? 🏟️`;
}

/**
 * Returns placeholder response for match Operational insights.
 * 
 * @param homeTeam - The name of the home team.
 * @param awayTeam - The name of the away team.
 * @returns Simple static preview string.
 */
export function mockMatchInsightResponse(homeTeam: string, awayTeam: string) {
  return `[Mock Insight] ${homeTeam} vs ${awayTeam} — Tactical preview coming soon.`;
}

/**
 * Returns placeholder response for incident command protocols.
 * 
 * @param type - The type of incident (e.g. fire, medical).
 * @param zone - The location zone of the incident.
 * @param severity - Severity rating of the logged threat.
 * @returns Static mock operational protocol guide.
 */
export function mockIncidentResponse(type: string, zone: string, severity: string) {
  return `[Mock Protocol] 5-step response for ${type} incident at ${zone} (${severity}).`;
}
