import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const total = parseFloat(searchParams.get('total') ?? '0');
  const transport = parseFloat(searchParams.get('transport') ?? '0');
  const energy = parseFloat(searchParams.get('energy') ?? '0');
  const diet = parseFloat(searchParams.get('diet') ?? '0');
  const shopping = parseFloat(searchParams.get('shopping') ?? '0');
  const name = searchParams.get('name') ?? 'You';
  const isBelow = total <= 4.7;
  const diff = Math.abs(total - 4.7).toFixed(1);

  const categories = [
    { label: 'Transport', value: transport, color: '#3b82f6' },
    { label: 'Energy',    value: energy,    color: '#f59e0b' },
    { label: 'Diet',      value: diet,      color: '#10b981' },
    { label: 'Shopping',  value: shopping,  color: '#8b5cf6' },
  ];

  return new ImageResponse(
    (
      <div style={{
        width: 1200, height: 630,
        background: '#ffffff',
        display: 'flex',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        {/* Left green accent strip */}
        <div style={{ width: 8, background: '#16a34a', height: '100%', flexShrink: 0 }} />

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '56px 64px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', background: '#16a34a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                  <ellipse cx="16" cy="16" rx="6" ry="10" stroke="white" strokeWidth="2" />
                  <ellipse cx="16" cy="16" rx="10" ry="6" stroke="white" strokeWidth="2" />
                  <circle cx="16" cy="16" r="2.5" fill="white" />
                </svg>
              </div>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.5px' }}>EcoAgents</span>
            </div>
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: 100, padding: '6px 16px',
              fontSize: 13, color: '#15803d', fontWeight: 600,
            }}>
              Earth Day 2026
            </div>
          </div>

          {/* Body */}
          <div style={{ display: 'flex', gap: 64, flex: 1, alignItems: 'center' }}>

            {/* Left — score */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <p style={{ fontSize: 18, color: '#9ca3af', margin: '0 0 4px', fontWeight: 500 }}>
                {name}&apos;s carbon footprint
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '0 0 20px' }}>
                <span style={{ fontSize: 100, fontWeight: 800, color: isBelow ? '#16a34a' : '#ef4444', lineHeight: 1 }}>
                  {total.toFixed(1)}
                </span>
                <span style={{ fontSize: 24, color: '#9ca3af', fontWeight: 500 }}>t CO₂/yr</span>
              </div>

              {/* Badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: isBelow ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${isBelow ? '#bbf7d0' : '#fecaca'}`,
                borderRadius: 12, padding: '10px 16px',
                marginBottom: 20, width: 'fit-content',
              }}>
                <span style={{ fontSize: 20 }}>{isBelow ? '✅' : '⚠️'}</span>
                <span style={{ fontSize: 17, color: isBelow ? '#15803d' : '#dc2626', fontWeight: 600 }}>
                  {diff}t {isBelow ? 'below' : 'above'} global average
                </span>
              </div>

              {/* Mini comparison */}
              <div style={{ display: 'flex', gap: 16 }}>
                {[
                  { label: 'India avg', val: '1.9t' },
                  { label: 'World avg', val: '4.7t' },
                  { label: 'US avg', val: '14.2t' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{item.label}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#374151' }}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — breakdown card */}
            <div style={{
              width: 300,
              background: '#f9fafb',
              borderRadius: 20,
              border: '1px solid #e5e7eb',
              padding: '28px 28px',
              display: 'flex', flexDirection: 'column', gap: 0,
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#374151', margin: '0 0 20px' }}>Breakdown</p>
              {categories.map(cat => {
                const pct = total > 0 ? Math.round((cat.value / total) * 100) : 0;
                return (
                  <div key={cat.label} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: '#6b7280' }}>{cat.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{cat.value.toFixed(1)}t</span>
                    </div>
                    <div style={{ height: 6, background: '#e5e7eb', borderRadius: 100, display: 'flex' }}>
                      <div style={{ width: `${pct}%`, height: 6, background: cat.color, borderRadius: 100, display: 'flex' }} />
                    </div>
                  </div>
                );
              })}
              <div style={{
                paddingTop: 16, marginTop: 4,
                borderTop: '1px solid #e5e7eb',
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Global avg</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#374151' }}>4.7t</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 32, paddingTop: 16,
            borderTop: '1px solid #e5e7eb',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>ecoagents.vercel.app</span>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>Gemini AI · Backboard Memory · Auth0</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}