# EcoAgents 🌍

> An AI agent that knows your carbon footprint and never lets you forget it.

**EcoAgents** is a personal sustainability agent that analyses your carbon footprint, builds a personalised action plan, and checks in every week — powered by Gemini AI, Auth0, and Backboard memory.
---

## Features

- **4-step onboarding** — transport, energy, diet, shopping with animated step transitions
- **Gemini AI analysis** — calculates your CO₂ breakdown across 4 categories and generates 6 ranked actions
- **Interactive dashboard** — donut chart breakdown, global comparison bar chart (vs India / World / China / USA)
- **EcoAgent chat** — streaming AI chat agent that knows your full profile, responds in real time
- **Shareable score card** — 1200×630 OG image generated on the edge, shareable anywhere
- **Weekly AI check-in** — Gemini writes a personalised email referencing your specific uncompleted actions
- **Persistent memory** — Backboard remembers your profile across sessions so the agent never forgets you
- **Auth0 for Agents** — secure login with per-user agent identity

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Auth | Auth0 for Agents v4 |
| AI | Google Gemini 2.5 Flash |
| Memory | Backboard |
| Email | Resend |
| Charts | Recharts |
| OG Images | Next.js ImageResponse |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Accounts for: [Auth0](https://auth0.com), [Google AI Studio](https://aistudio.google.com), [Backboard](https://backboard.io), [Resend](https://resend.com), [Vercel](https://vercel.com)

### 1. Clone the repo

```bash
git clone https://github.com/Navin1-11-04/Ecoagents.git
cd Ecoagents
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the root:

```env
# Auth0 (v4 SDK)
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_SECRET=run_openssl_rand_base64_32
APP_BASE_URL=http://localhost:3000

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Backboard
BACKBOARD_API_KEY=your_backboard_api_key

# Resend
RESEND_API_KEY=re_your_resend_key
```

### 3. Configure Auth0

In your Auth0 dashboard → Applications → your app → Settings:

```
Allowed Callback URLs:  http://localhost:3000/auth/callback
Allowed Logout URLs:    http://localhost:3000
Allowed Web Origins:    http://localhost:3000
```

> **Note:** Auth0 v4 uses `/auth/callback` not `/api/auth/callback`

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts      # Gemini footprint analysis + Backboard memory
│   │   ├── chat/route.ts         # Streaming Gemini chat agent
│   │   ├── checkin/route.ts      # Weekly email via Resend
│   │   └── scorecard/route.tsx   # OG image generation (edge runtime)
│   ├── dashboard/page.tsx        # Protected dashboard page
│   ├── onboarding/page.tsx       # Protected onboarding page
│   └── page.tsx                  # Landing page
├── components/
│   ├── Dashboard.tsx             # Dashboard UI with charts + chat
│   ├── Logo.tsx                  # Shared logo component
│   └── OnboardingWizard.tsx      # Multi-step onboarding form
└── lib/
    └── auth0.ts                  # Auth0 client
```

---

## Architecture

```
User → Auth0 (identity)
          ↓
    Onboarding wizard (4 steps)
          ↓
    Gemini 2.5 Flash (analysis)
          ↓
    Backboard (persistent memory)
          ↓
    Dashboard
      ├── Recharts (CO₂ visualisation)
      ├── Streaming chat agent (Gemini)
      ├── Score card (Next.js ImageResponse)
      └── Weekly email (Resend + Gemini)
```

---

## Deploying to Vercel

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.local`
4. Deploy

After deployment, add your Vercel URL to Auth0:

```
Allowed Callback URLs:  http://localhost:3000/auth/callback, https://YOUR-APP.vercel.app/auth/callback
Allowed Logout URLs:    http://localhost:3000, https://YOUR-APP.vercel.app
Allowed Web Origins:    http://localhost:3000, https://YOUR-APP.vercel.app
```

---

## Key Implementation Notes

**Auth0 v4 breaking changes from v3:**
- Routes: `/api/auth/*` → `/auth/*`
- `middleware.ts` → `proxy.ts` in Next.js 16
- `AUTH0_BASE_URL` → `APP_BASE_URL`
- `AUTH0_ISSUER_BASE_URL` → `AUTH0_DOMAIN` (no `https://`)

**Streaming chat:**
```typescript
// API route returns a ReadableStream
const result = await model.generateContentStream(prompt);
return new Response(stream, {
  headers: { 'Content-Type': 'text/plain; charset=utf-8' },
});

// Client reads chunks progressively
const reader = res.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // append chunk to message
}
```

**Gemini JSON parsing — always strip code fences:**
```typescript
const clean = text.replace(/```json|```/g, '').trim();
const analysis = JSON.parse(clean);
```

---

## Built For

[DEV Weekend Challenge: Earth Day Edition](https://dev.to/challenges/weekend-2026-04-16) — April 2026

Prize categories entered:
- Best use of Auth0 for Agents
- Best use of Google Gemini
- Best use of Backboard
- Best use of GitHub Copilot

---

## License

MIT
