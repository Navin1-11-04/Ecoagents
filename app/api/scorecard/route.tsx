import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const total = searchParams.get('total') ?? '0';
  const transport = searchParams.get('transport') ?? '0';
  const energy = searchParams.get('energy') ?? '0';
  const diet = searchParams.get('diet') ?? '0';
  const shopping = searchParams.get('shopping') ?? '0';
  const name = searchParams.get('name') ?? 'You';
  const comparison = searchParams.get('comparison') ?? '';

  const totalNum = parseFloat(total);
  const globalAvg = 4.7;
  const isBelow = totalNum <= globalAvg;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #ecfdf5 100%)',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'rgba(134,239,172,0.15)', display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'rgba(52,211,153,0.1)', display: 'flex',
        }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: '#16a34a', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '24px',
            }}>🌍</div>
            <span style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>EcoAgents</span>
          </div>
          <div style={{
            background: '#dcfce7', border: '1px solid #bbf7d0',
            borderRadius: '100px', padding: '8px 20px',
            fontSize: '16px', color: '#15803d', fontWeight: '600',
          }}>
            Earth Day 2026
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', gap: '48px', flex: 1 }}>
          {/* Left — big score */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '20px', color: '#6b7280', margin: '0 0 8px', fontWeight: '500' }}>
              {name}'s carbon footprint
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '96px', fontWeight: '800', color: isBelow ? '#16a34a' : '#dc2626', lineHeight: 1 }}>
                {totalNum.toFixed(1)}
              </span>
              <span style={{ fontSize: '28px', color: '#9ca3af', fontWeight: '500' }}>t CO₂/yr</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: isBelow ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${isBelow ? '#bbf7d0' : '#fecaca'}`,
              borderRadius: '12px', padding: '12px 16px', marginBottom: '16px',
            }}>
              <span style={{ fontSize: '20px' }}>{isBelow ? '✅' : '⚠️'}</span>
              <span style={{ fontSize: '16px', color: isBelow ? '#15803d' : '#dc2626', fontWeight: '500' }}>
                {isBelow ? `${(globalAvg - totalNum).toFixed(1)}t below global average` : `${(totalNum - globalAvg).toFixed(1)}t above global average`}
              </span>
            </div>
            {comparison ? (
              <p style={{ fontSize: '15px', color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>
                {comparison.slice(0, 100)}
              </p>
            ) : null}
          </div>

          {/* Right — breakdown */}
          <div style={{
            width: '340px', background: 'white', borderRadius: '24px',
            border: '1px solid #f3f4f6', padding: '28px',
            display: 'flex', flexDirection: 'column', gap: '16px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontSize: '16px', fontWeight: '700', color: '#374151', margin: 0 }}>
              Breakdown
            </p>
            {[
              { label: '✈️ Transport', val: parseFloat(transport), color: '#3b82f6' },
              { label: '⚡ Energy',    val: parseFloat(energy),    color: '#f59e0b' },
              { label: '🥗 Diet',      val: parseFloat(diet),      color: '#10b981' },
              { label: '🛍️ Shopping', val: parseFloat(shopping),  color: '#8b5cf6' },
            ].map((item) => {
              const pct = Math.round((item.val / totalNum) * 100) || 0;
              return (
                <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>{item.label}</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>
                      {item.val.toFixed(1)}t
                    </span>
                  </div>
                  <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '100px', display: 'flex' }}>
                    <div style={{
                      width: `${pct}%`, height: '8px',
                      background: item.color, borderRadius: '100px',
                      display: 'flex',
                    }} />
                  </div>
                </div>
              );
            })}

            <div style={{
              marginTop: '4px', paddingTop: '16px',
              borderTop: '1px solid #f3f4f6',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>Global avg</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#6b7280' }}>4.7t</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '32px', paddingTop: '20px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '14px', color: '#9ca3af' }}>
            Generated by EcoAgents · ecoagents.vercel.app
          </span>
          <span style={{ fontSize: '14px', color: '#9ca3af' }}>
            Powered by Gemini AI + Backboard Memory
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}