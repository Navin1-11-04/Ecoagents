import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const BACKBOARD_BASE = 'https://app.backboard.io/api';
const BACKBOARD_KEY = process.env.BACKBOARD_API_KEY!;

async function backboardPost(path: string, body: object) {
  const res = await fetch(`https://app.backboard.io/api${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.BACKBOARD_API_KEY!,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Backboard ${path} failed: ${res.status} — ${text}`);
  }

  return JSON.parse(text);
}

export async function POST(req: NextRequest) {
  const session = await auth0.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();
  const userId = session.user.sub as string;

  // ── Gemini analysis ──────────────────────────────────────────
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
You are an expert carbon footprint analyst and sustainability coach.

A user has provided the following lifestyle data:
- Flights per year: ${data.flightsPerYear}
- Car type: ${data.carType}
- Km driven per week: ${data.kmPerWeek}
- Home energy source: ${data.energySource}
- Home size: ${data.homeSize}
- Diet type: ${data.dietType}
- Meat meals per week: ${data.meatPerWeek}
- New clothes per year: ${data.newClothesPerYear}
- Online orders per month: ${data.onlineOrdersPerMonth}

Return a JSON object (no markdown, no backticks, raw JSON only) with this exact structure:
{
  "totalTonnesCO2PerYear": <number>,
  "breakdown": {
    "transport": <number>,
    "energy": <number>,
    "diet": <number>,
    "shopping": <number>
  },
  "comparison": "<one sentence comparing to global average>",
  "actions": [
    {
      "id": "1",
      "title": "<short action title>",
      "description": "<one sentence explanation>",
      "impact": <tonnes CO2 saved per year as number>,
      "difficulty": "easy" | "medium" | "hard",
      "category": "transport" | "energy" | "diet" | "shopping"
    }
  ],
  "agentMessage": "<a warm, motivating 2-sentence message from the AI agent to the user>"
}

Return exactly 6 actions ranked by impact descending. Be accurate with CO2 estimates.
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  let analysis;
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    analysis = JSON.parse(clean);
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
  }

  // ── Backboard: create or reuse assistant per user ─────────────
  try {
    // Create a dedicated assistant for this user (idempotent by name)
    const assistant = await backboardPost('/assistants', {
      name: `EcoAgent_${userId}`,
      system_prompt: `You are EcoAgent, a personal sustainability coach for this user. 
      You remember their carbon footprint profile and completed actions.
      Always be encouraging and specific to their situation.`,
      llm_provider: 'google',
      llm_model_name: 'gemini-2.5-flash',
      memory: 'Auto',
    });

    const assistantId = assistant.assistant_id;

    // Create a thread for this analysis session
    const thread = await backboardPost(`/assistants/${assistantId}/threads`, {
      metadata: { userId, type: 'eco_profile' },
    });

    // Store the analysis as a message (memory=Auto means Backboard extracts facts)
    await backboardPost(`/threads/${thread.thread_id}/messages`, {
      role: 'user',
      content: `My carbon footprint analysis: ${JSON.stringify({ rawData: data, analysis })}. 
      My total is ${analysis.totalTonnesCO2PerYear} tonnes CO2/year. 
      Completed actions: none yet. Created: ${new Date().toISOString()}`,
      memory: 'Auto',
      send_to_llm: false,
    });

    // Store IDs in analysis for later retrieval
    analysis._backboard = { assistantId, threadId: thread.thread_id };
  } catch (e) {
    console.error('Backboard save failed (non-fatal):', e);
  }

  // ── Return + set cookie for dashboard ────────────────────────
  const response = NextResponse.json({ success: true, analysis });
  response.cookies.set('eco_analysis', JSON.stringify(analysis), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
  });

  return response;
}