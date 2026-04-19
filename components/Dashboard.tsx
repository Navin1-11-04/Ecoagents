'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine, LabelList,
} from 'recharts';

const CATEGORY_PILL: Record<string, string> = {
  transport: 'bg-blue-50 text-blue-600',
  energy:    'bg-amber-50 text-amber-600',
  diet:      'bg-green-50 text-green-600',
  shopping:  'bg-violet-50 text-violet-600',
};
const DIFFICULTY_PILL: Record<string, string> = {
  easy:   'bg-green-50 text-green-600',
  medium: 'bg-amber-50 text-amber-600',
  hard:   'bg-red-50 text-red-500',
};
const CHART_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];
const CAT_ICONS: Record<string, string> = {
  transport: '✈️', energy: '⚡', diet: '🥗', shopping: '🛍️',
};
const BENCHMARKS = [
  { country: 'India',     value: 1.9,  fill: '#86efac' },
  { country: 'World avg', value: 4.7,  fill: '#d1d5db' },
  { country: 'China',     value: 8.4,  fill: '#fca5a5' },
  { country: 'USA',       value: 14.2, fill: '#fca5a5' },
];

const DonutLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.08) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + r * Math.sin(-midAngle * Math.PI / 180);
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>{`${(percent * 100).toFixed(0)}%`}</text>;
};

export default function Dashboard({ analysis, user }: { analysis: any; user: any }) {
  const router = useRouter();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<'breakdown' | 'benchmark'>('breakdown');
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'agent'; text: string }[]>([
    { role: 'agent', text: `Hi! I'm your EcoAgent 🌱 I know your full carbon profile. Ask me anything about your footprint or how to reduce it.` },
  ]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const total: number = analysis.totalTonnesCO2PerYear;
  const breakdown = analysis.breakdown;
  const isBelow = total <= 4.7;
  const diff = Math.abs(total - 4.7).toFixed(1);

  const savedTonnes = analysis.actions
    .filter((a: any) => completed.has(a.id))
    .reduce((s: number, a: any) => s + a.impact, 0);

  const toggle = (id: string) => setCompleted(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const donutData = Object.entries(breakdown)
    .filter(([, v]) => (v as number) > 0)
    .map(([k, v]) => ({ name: k, value: parseFloat((v as number).toFixed(2)) }));

  const benchData = [...BENCHMARKS,
    { country: 'You', value: parseFloat(total.toFixed(1)), fill: isBelow ? '#16a34a' : '#ef4444' },
  ].sort((a, b) => a.value - b.value);

  const share = async () => {
    setSharing(true);
    const p = new URLSearchParams({
      total: total.toString(), transport: breakdown.transport.toString(),
      energy: breakdown.energy.toString(), diet: breakdown.diet.toString(),
      shopping: breakdown.shopping.toString(), name: user.given_name ?? user.name,
      comparison: analysis.comparison ?? '',
    });
    window.open(`/api/scorecard?${p}`, '_blank');
    setShared(true);
    setTimeout(() => setShared(false), 3000);
    setSharing(false);
  };

  const sendCheckin = async () => {
    setEmailLoading(true);
    try {
      await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedActions: Array.from(completed)
            .map(id => analysis.actions.find((a: any) => a.id === id)?.title)
            .filter(Boolean),
        }),
      });
      setEmailSent(true);
    } catch (e) { console.error(e); }
    finally { setEmailLoading(false); }
  };

  const sendMsg = async () => {
    if (!input.trim() || chatLoading) return;
    const msg = input.trim();
    setInput('');
    setMessages(p => [...p, { role: 'user', text: msg }, { role: 'agent', text: '' }]);
    setChatLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      if (!res.body) throw new Error();
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value, { stream: true });
        setMessages(p => { const u = [...p]; u[u.length - 1] = { role: 'agent', text: u[u.length - 1].text + chunk }; return u; });
      }
    } catch {
      setMessages(p => { const u = [...p]; u[u.length - 1] = { role: 'agent', text: 'Something went wrong.' }; return u; });
    } finally { setChatLoading(false); }
  };

  const sendPrompt = (p: string) => {
    setMessages(prev => [...prev, { role: 'user', text: p }, { role: 'agent', text: '' }]);
    setChatLoading(true);
    fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: p }) })
      .then(async res => {
        if (!res.body) throw new Error();
        const reader = res.body.getReader(); const dec = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read(); if (done) break;
          const chunk = dec.decode(value, { stream: true });
          setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'agent', text: u[u.length - 1].text + chunk }; return u; });
        }
      })
      .catch(() => setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'agent', text: 'Something went wrong.' }; return u; }))
      .finally(() => setChatLoading(false));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-5 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <Logo size="sm" />
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Weekly check-in — in nav bar */}
          <button
            onClick={sendCheckin}
            disabled={emailLoading || emailSent}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-600 rounded-lg hover:border-green-400 hover:text-green-700 disabled:opacity-50 transition-all"
          >
            {emailSent ? '✅ Sent!' : emailLoading ? '⏳' : '📬'}&nbsp;
            {emailSent ? 'Email sent' : 'Weekly check-in'}
          </button>
          <button
            onClick={share}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-600 rounded-lg hover:border-green-400 hover:text-green-700 transition-all"
          >
            {shared ? '✅' : '🎴'}&nbsp;{shared ? 'Opened' : 'Share score'}
          </button>
          <span className="text-sm text-gray-500 hidden sm:block">{user.given_name ?? user.name}</span>
          <a href="/auth/logout" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Sign out</a>
        </div>
      </nav>

      {/* Mobile action bar */}
      <div className="sm:hidden flex gap-2 px-4 py-3 bg-white border-b border-gray-100">
        <button onClick={sendCheckin} disabled={emailLoading || emailSent}
          className="flex-1 py-2 text-xs font-medium border border-gray-200 text-gray-600 rounded-lg disabled:opacity-50 hover:border-green-400 hover:text-green-700 transition-all">
          {emailSent ? '✅ Email sent' : emailLoading ? 'Sending…' : '📬 Weekly check-in'}
        </button>
        <button onClick={share}
          className="flex-1 py-2 text-xs font-medium border border-gray-200 text-gray-600 rounded-lg hover:border-green-400 hover:text-green-700 transition-all">
          {shared ? '✅ Opened' : '🎴 Share score'}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">

        {/* Agent banner */}
        <div className="flex gap-3 p-4 bg-white rounded-2xl border border-gray-100 mb-6">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-base shrink-0">🤖</div>
          <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{analysis.agentMessage}</p>
        </div>

        {/* Score row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Your footprint</p>
            <p className={`text-3xl font-bold ${isBelow ? 'text-green-600' : 'text-red-500'}`}>{total.toFixed(1)}</p>
            <p className="text-xs text-gray-400 mt-0.5">t CO₂/yr</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Global avg</p>
            <p className="text-3xl font-bold text-gray-400">4.7</p>
            <p className="text-xs text-gray-400 mt-0.5">t CO₂/yr</p>
          </div>
          <div className={`rounded-xl border p-4 text-center ${isBelow ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className={`text-xs mb-1 ${isBelow ? 'text-green-600' : 'text-red-500'}`}>{isBelow ? 'Below avg' : 'Above avg'}</p>
            <p className={`text-3xl font-bold ${isBelow ? 'text-green-600' : 'text-red-500'}`}>{diff}</p>
            <p className={`text-xs mt-0.5 ${isBelow ? 'text-green-500' : 'text-red-400'}`}>tonnes</p>
          </div>
        </div>

        {/* Charts */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-5">
            {(['breakdown', 'benchmark'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                {t === 'breakdown' ? 'Breakdown' : 'vs World'}
              </button>
            ))}
          </div>

          {tab === 'breakdown' && (
            <div className="flex flex-col sm:flex-row gap-5 items-center">
              <div style={{ width: '100%', maxWidth: 180, height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={48} outerRadius={82}
                      paddingAngle={3} dataKey="value" labelLine={false} label={DonutLabel}>
                      {donutData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % 4]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${v}t`, '']}
                      contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 w-full space-y-2.5">
                {donutData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i % 4] }} />
                      <span className="text-sm text-gray-600 capitalize">{CAT_ICONS[item.name]} {item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{item.value}t <span className="text-xs text-gray-400 font-normal">({Math.round(item.value / total * 100)}%)</span></span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-100 flex justify-between">
                  <span className="text-xs text-gray-400">Total</span>
                  <span className="text-sm font-bold text-gray-800">{total.toFixed(1)}t/yr</span>
                </div>
              </div>
            </div>
          )}

          {tab === 'benchmark' && (
            <>
              <p className="text-xs text-gray-400 mb-3">Personal footprint vs country averages (t CO₂/yr)</p>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={benchData} margin={{ top: 14, right: 12, left: -22, bottom: 0 }} barSize={30}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="country" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} unit="t" />
                    <ReferenceLine y={4.7} stroke="#d1d5db" strokeDasharray="4 3"
                      label={{ value: 'avg', position: 'insideTopRight', fontSize: 9, fill: '#9ca3af' }} />
                    <Tooltip formatter={(v: any) => [`${v}t CO₂/yr`, '']}
                      contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                    <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                      {benchData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#6b7280', fontWeight: 600 }} formatter={(v: any) => `${v}t`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center italic">{analysis.comparison}</p>
            </>
          )}
        </div>

        {/* Action plan */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800">Action plan</h2>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-24 h-1.5 bg-gray-100 rounded-full">
              <div className="h-1.5 bg-green-500 rounded-full transition-all" style={{ width: `${(completed.size / analysis.actions.length) * 100}%` }} />
            </div>
            <span>{completed.size}/{analysis.actions.length}</span>
            {savedTonnes > 0 && <span className="text-green-600 font-medium">· {savedTonnes.toFixed(1)}t saved</span>}
          </div>
        </div>

        <div className="space-y-2 mb-10">
          {analysis.actions.map((action: any) => {
            const done = completed.has(action.id);
            return (
              <div key={action.id} onClick={() => toggle(action.id)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${done ? 'border-green-200 bg-green-50/50' : 'border-gray-100 hover:border-gray-200'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-colors ${done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                    {done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{action.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{action.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-md ${CATEGORY_PILL[action.category]}`}>{action.category}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-md ${DIFFICULTY_PILL[action.difficulty]}`}>{action.difficulty}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-sm font-semibold text-green-600">-{action.impact.toFixed(1)}t</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pb-24">
          <button onClick={() => router.push('/onboarding')} className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors">
            Recalculate my footprint
          </button>
        </div>
      </div>

      {/* Chat toggle */}
      <button onClick={() => setChatOpen(o => !o)}
        className="fixed bottom-6 right-4 sm:right-6 w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-50 text-xl">
        {chatOpen ? '✕' : '🌿'}
      </button>

      {/* Chat */}
      {chatOpen && (
        <div className="fixed z-50 bg-white shadow-xl border border-gray-100 flex flex-col
          inset-x-0 bottom-0 rounded-t-2xl sm:rounded-2xl sm:bottom-22 sm:right-5 sm:left-auto sm:w-76"
          style={{ height: '65vh', maxHeight: 480, width: undefined }}>
          <div className="bg-green-600 text-white px-4 py-3 rounded-t-2xl shrink-0 flex justify-between items-start">
            <div>
              <p className="font-medium text-sm">EcoAgent</p>
              <p className="text-xs opacity-70">Powered by Gemini + Backboard memory</p>
            </div>
            <button onClick={() => setChatOpen(false)} className="opacity-70 hover:opacity-100 sm:hidden">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                  m.role === 'user' ? 'bg-green-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  {m.text || (m.role === 'agent' && chatLoading && (
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div ref={messagesEnd} />
          </div>

          {messages.length === 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1 shrink-0">
              {['What should I do first?', 'Biggest impact?', 'Easy wins?'].map(p => (
                <button key={p} onClick={() => sendPrompt(p)}
                  className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg px-2 py-1 hover:bg-green-100 transition-colors">
                  {p}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 border-t border-gray-100 flex gap-2 shrink-0">
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMsg()}
              placeholder="Ask anything…"
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-400" />
            <button onClick={sendMsg} disabled={chatLoading || !input.trim()}
              className="bg-green-600 text-white rounded-lg px-3 py-2 text-sm hover:bg-green-700 disabled:opacity-40 transition-colors">
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}