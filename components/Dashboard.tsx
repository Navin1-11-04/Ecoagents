'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORY_COLORS: Record<string, string> = {
  transport: 'bg-blue-100 text-blue-700',
  energy:    'bg-yellow-100 text-yellow-700',
  diet:      'bg-green-100 text-green-700',
  shopping:  'bg-purple-100 text-purple-700',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:   'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard:   'bg-red-100 text-red-700',
};

const CATEGORY_ICONS: Record<string, string> = {
  transport: '✈️',
  energy:    '⚡',
  diet:      '🥗',
  shopping:  '🛍️',
};

export default function Dashboard({ analysis, user }: { analysis: any; user: any }) {
  const router = useRouter();
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const [sharing, setSharing] = useState(false);
const [shared, setShared] = useState(false);
const [emailSent, setEmailSent] = useState(false);
const [emailLoading, setEmailLoading] = useState(false);

  // ── Chat state ───────────────────────────────────────────────
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'agent'; text: string }[]>([
    {
      role: 'agent',
      text: `Hi! I'm your EcoAgent 🌱 I know your full carbon profile. Ask me anything — how to start an action, what has the biggest impact, or anything about your footprint.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || chatLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'agent', text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'agent', text: 'Sorry, something went wrong. Try again!' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const shareScoreCard = async () => {
  setSharing(true);
  try {
    const params = new URLSearchParams({
      total: total.toString(),
      transport: breakdown.transport.toString(),
      energy: breakdown.energy.toString(),
      diet: breakdown.diet.toString(),
      shopping: breakdown.shopping.toString(),
      name: user.given_name ?? user.name,
      comparison: analysis.comparison ?? '',
    });
    const url = `/api/scorecard?${params}`;
    // Open in new tab so they can screenshot / save
    window.open(url, '_blank');
    setShared(true);
    setTimeout(() => setShared(false), 3000);
  } finally {
    setSharing(false);
  }

  const sendCheckin = async () => {
  setEmailLoading(true);
  try {
    await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completedActions: Array.from(completed).map(
        (id) => analysis.actions.find((a: any) => a.id === id)?.title
      ).filter(Boolean) }),
    });
    setEmailSent(true);
  } catch (e) {
    console.error(e);
  } finally {
    setEmailLoading(false);
  }
};

  // ── Footprint calculations ───────────────────────────────────
  const toggleAction = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const savedTonnes = analysis.actions
    .filter((a: any) => completed.has(a.id))
    .reduce((sum: number, a: any) => sum + a.impact, 0);

  const total: number = analysis.totalTonnesCO2PerYear;
  const breakdown = analysis.breakdown;
  const maxBreakdown = Math.max(...(Object.values(breakdown) as number[]));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌍</span>
          <span className="font-semibold text-gray-900">EcoAgents</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user.given_name ?? user.name}</span>
          <a
            href="/auth/logout"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Sign out
          </a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Agent message */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-8 flex gap-3">
          <span className="text-2xl">🤖</span>
          <p className="text-green-800 text-sm leading-relaxed">{analysis.agentMessage}</p>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <p className="text-xs text-gray-400 mb-1">Your footprint</p>
            <p className="text-3xl font-semibold text-gray-900">{total.toFixed(1)}</p>
            <p className="text-xs text-gray-400 mt-1">tonnes CO₂/yr</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <p className="text-xs text-gray-400 mb-1">Global avg</p>
            <p className="text-3xl font-semibold text-gray-500">4.7</p>
            <p className="text-xs text-gray-400 mt-1">tonnes CO₂/yr</p>
          </div>
          <div className="bg-green-50 rounded-2xl border border-green-200 p-5 text-center">
            <p className="text-xs text-green-600 mb-1">You could save</p>
            <p className="text-3xl font-semibold text-green-700">{savedTonnes.toFixed(1)}</p>
            <p className="text-xs text-green-600 mt-1">tonnes CO₂/yr</p>
          </div>
        </div>

        {/* Share button */}
<div className="flex justify-center mb-8">
  <button
    onClick={shareScoreCard}
    className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-5 py-2.5 rounded-2xl text-sm hover:border-green-400 hover:text-green-700 transition-all"
  >
    {shared ? (
      <>✅ Score card opened!</>
    ) : (
      <>{sharing ? '⏳' : '🎴'} Share my eco score</>
    )}
  </button>
</div>

        {/* Breakdown bars */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <h2 className="text-sm font-medium text-gray-700 mb-4">Footprint breakdown</h2>
          {Object.entries(breakdown).map(([key, val]) => {
            const pct = Math.round(((val as number) / maxBreakdown) * 100);
            return (
              <div key={key} className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span className="capitalize">
                    {CATEGORY_ICONS[key]} {key}
                  </span>
                  <span>{(val as number).toFixed(1)}t</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-2 bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
          <p className="text-xs text-gray-400 mt-4 italic">{analysis.comparison}</p>
        </div>

        {/* Action plan */}
        <h2 className="text-sm font-medium text-gray-700 mb-3">Your action plan</h2>
        <div className="space-y-3 mb-10">
          {analysis.actions.map((action: any) => {
            const done = completed.has(action.id);
            return (
              <div
                key={action.id}
                onClick={() => toggleAction(action.id)}
                className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all ${
                  done
                    ? 'border-green-300 bg-green-50 opacity-75'
                    : 'border-gray-100 hover:border-green-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`w-5 h-5 min-w-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-colors ${
                        done ? 'bg-green-500 border-green-500' : 'border-gray-300'
                      }`}
                    >
                      {done && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          done ? 'line-through text-gray-400' : 'text-gray-800'
                        }`}
                      >
                        {action.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                    </div>
                  </div>
                  <div className="text-right min-w-fit">
                    <p className="text-sm font-semibold text-green-700">
                      -{action.impact.toFixed(1)}t
                    </p>
                    <div className="flex gap-1 mt-1 justify-end flex-wrap">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[action.category]}`}
                      >
                        {action.category}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[action.difficulty]}`}
                      >
                        {action.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

{/* Weekly agent check-in */}
<div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 flex items-center justify-between gap-4">
  <div>
    <p className="text-sm font-medium text-gray-800">📬 Weekly AI check-in</p>
    <p className="text-xs text-gray-400 mt-0.5">
      Your EcoAgent will email you progress updates and personalised tips
    </p>
  </div>
  <button
    onClick={sendCheckin}
    disabled={emailLoading || emailSent}
    className="shrink-0 px-4 py-2 bg-green-600 text-white text-sm rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors whitespace-nowrap"
  >
    {emailSent ? '✅ Sent!' : emailLoading ? 'Sending…' : 'Send now'}
  </button>
</div>
        {/* Redo */}
        <div className="text-center pb-20">
          <button
            onClick={() => router.push('/onboarding')}
            className="text-sm text-gray-400 hover:text-gray-600 underline transition-colors"
          >
            Recalculate my footprint
          </button>
        </div>
      </div>

      {/* ── Floating chat button ─────────────────────────────── */}
      <button
        onClick={() => setChatOpen((o) => !o)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-all z-50"
        aria-label="Open EcoAgent chat"
      >
        {chatOpen ? '✕' : '🌿'}
      </button>

      {/* ── Chat panel ──────────────────────────────────────── */}
      {chatOpen && (
        <div
          className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col z-50"
          style={{ height: '420px' }}
        >
          {/* Header */}
          <div className="bg-green-600 text-white px-4 py-3 rounded-t-2xl shrink-0">
            <p className="font-medium text-sm">EcoAgent</p>
            <p className="text-xs opacity-75">Powered by Gemini + Backboard memory</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-green-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-xl rounded-bl-sm">
                  <div className="flex gap-1 items-center h-4">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested prompts — only shown when just the welcome message */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1 shrink-0">
              {[
                'What should I do first?',
                'Biggest impact action?',
                'Easy wins for me?',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInput(prompt);
                    setTimeout(() => {
                      setInput('');
                      setMessages((prev) => [...prev, { role: 'user', text: prompt }]);
                      setChatLoading(true);
                      fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: prompt }),
                      })
                        .then((r) => r.json())
                        .then((d) =>
                          setMessages((prev) => [...prev, { role: 'agent', text: d.reply }])
                        )
                        .catch(() =>
                          setMessages((prev) => [
                            ...prev,
                            { role: 'agent', text: 'Something went wrong. Try again!' },
                          ])
                        )
                        .finally(() => setChatLoading(false));
                    }, 0);
                  }}
                  className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg px-2 py-1 hover:bg-green-100 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-100 flex gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask your EcoAgent..."
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-green-400"
            />
            <button
              onClick={sendMessage}
              disabled={chatLoading || !input.trim()}
              className="bg-green-600 text-white rounded-xl px-3 py-2 text-sm hover:bg-green-700 disabled:opacity-40 transition-colors"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}