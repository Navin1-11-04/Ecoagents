import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { Resend } from 'resend';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { cookies } from 'next/headers';

const resend = new Resend(process.env.RESEND_API_KEY!);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const session = await auth0.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cookieStore = await cookies();
  const raw = cookieStore.get('eco_analysis')?.value;
  if (!raw) return NextResponse.json({ error: 'No analysis found' }, { status: 400 });

  const analysis = JSON.parse(raw);
  const { completedActions = [] } = await req.json();

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Generate personalised email content via Gemini
  const prompt = `
You are EcoAgent writing a warm weekly check-in email to ${session.user.given_name ?? session.user.name}.

Their profile:
- Total footprint: ${analysis.totalTonnesCO2PerYear}t CO2/year
- Completed actions this week: ${completedActions.length > 0 ? completedActions.join(', ') : 'none yet'}
- All actions: ${analysis.actions.map((a: any) => a.title).join(', ')}

Write a short, warm, personal weekly check-in. Include:
1. A one-sentence acknowledgment of their progress (or encouragement if no actions yet)
2. ONE specific tip relevant to their highest-impact uncompleted action
3. A motivating closing line

Keep it under 150 words. Plain text, no markdown.
`;

  const result = await model.generateContent(prompt);
  const emailBody = result.response.text();

  const nextAction = analysis.actions.find(
    (a: any) => !completedActions.includes(a.title)
  );

  await resend.emails.send({
    from: 'EcoAgent <onboarding@resend.dev>',
    to: session.user.email!,
    subject: `🌱 Your weekly eco check-in — ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #374151;">
  <div style="margin-bottom: 24px;">
    <span style="font-size: 24px;">🌍</span>
    <strong style="font-size: 18px; color: #111827; margin-left: 8px;">EcoAgents</strong>
  </div>

  <h2 style="font-size: 22px; font-weight: 600; color: #111827; margin: 0 0 16px;">
    Weekly check-in, ${session.user.given_name ?? session.user.name} 🌿
  </h2>

  <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
    <p style="margin: 0; font-size: 15px; color: #15803d; line-height: 1.6;">
      ${emailBody.replace(/\n/g, '<br/>')}
    </p>
  </div>

  ${nextAction ? `
  <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
    <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;">
      Your next action
    </p>
    <p style="margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #111827;">${nextAction.title}</p>
    <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">${nextAction.description}</p>
    <span style="font-size: 13px; color: #16a34a; font-weight: 500;">Saves ${nextAction.impact.toFixed(1)}t CO₂/yr</span>
  </div>
  ` : ''}

  <div style="text-align: center; margin: 32px 0;">
    <a href="${process.env.APP_BASE_URL}/dashboard"
       style="background: #16a34a; color: white; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-size: 15px; font-weight: 500;">
      View my dashboard →
    </a>
  </div>

  <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 32px;">
    EcoAgents · Powered by Gemini AI + Backboard Memory<br/>
    <a href="${process.env.APP_BASE_URL}/dashboard" style="color: #9ca3af;">Unsubscribe</a>
  </p>
</body>
</html>
    `,
  });

  return NextResponse.json({ success: true });
}