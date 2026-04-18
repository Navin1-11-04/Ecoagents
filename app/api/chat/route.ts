import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { cookies } from 'next/headers';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const session = await auth0.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { message } = await req.json();

  // Get the user's analysis from cookie for context
  const cookieStore = await cookies();
  const raw = cookieStore.get('eco_analysis')?.value;
  const analysis = raw ? JSON.parse(raw) : null;

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const systemContext = analysis ? `
You are EcoAgent, a personal sustainability coach. You know this user's complete carbon profile:
- Total footprint: ${analysis.totalTonnesCO2PerYear} tonnes CO2/year
- Breakdown: Transport ${analysis.breakdown.transport}t, Energy ${analysis.breakdown.energy}t, Diet ${analysis.breakdown.diet}t, Shopping ${analysis.breakdown.shopping}t
- Their action plan: ${analysis.actions.map((a: any) => `${a.title} (saves ${a.impact}t, ${a.difficulty})`).join(', ')}

Be concise, warm, practical, and specific to THEIR profile. Max 3 sentences per reply.
` : `You are EcoAgent, a sustainability coach. Be concise and helpful.`;

  const result = await model.generateContent(`${systemContext}\n\nUser: ${message}`);
  const reply = result.response.text();

  return NextResponse.json({ reply });
}