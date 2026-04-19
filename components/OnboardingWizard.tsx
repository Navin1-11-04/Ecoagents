'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

type FormData = {
  flightsPerYear: number;
  carType: string;
  kmPerWeek: number;
  energySource: string;
  homeSize: string;
  dietType: string;
  meatPerWeek: number;
  newClothesPerYear: number;
  onlineOrdersPerMonth: number;
};

const initialData: FormData = {
  flightsPerYear: 2,
  carType: 'petrol',
  kmPerWeek: 100,
  energySource: 'grid',
  homeSize: 'medium',
  dietType: 'omnivore',
  meatPerWeek: 4,
  newClothesPerYear: 10,
  onlineOrdersPerMonth: 4,
};

const STEPS = [
  { id: 'transport', title: 'Transport',   sub: 'How do you get around?',         emoji: '✈️' },
  { id: 'energy',    title: 'Home energy', sub: 'How do you power your home?',    emoji: '⚡' },
  { id: 'diet',      title: 'Diet',        sub: 'What does your diet look like?', emoji: '🥗' },
  { id: 'shopping',  title: 'Shopping',    sub: 'Your consumption habits',        emoji: '🛍️' },
  { id: 'done',      title: 'All done',    sub: 'Ready to see your plan',         emoji: '🌿' },
];

export default function OnboardingWizard({ user }: { user: any }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(initialData);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  const [dir, setDir] = useState<1 | -1>(1);

  const update = (field: keyof FormData, value: any) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const go = (next: number, direction: 1 | -1) => {
    setDir(direction);
    setVisible(false);
    setTimeout(() => { setStep(next); setVisible(true); }, 180);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const text = await res.text();
      if (!text) throw new Error('Empty');
      const result = JSON.parse(text);
      if (result.success) router.push('/dashboard');
    } catch (e) {
      console.error(e);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Lock to exactly viewport height, no overflow
    <div style={{ height: '100dvh' }} className="bg-gray-50 flex flex-col overflow-hidden">

      {/* ── Top nav — fixed height ── */}
      <div className="shrink-0 px-5 py-3.5 bg-white border-b border-gray-100 flex items-center justify-between">
        <Logo size="sm" />
        <div className="flex items-center gap-2.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-5 h-1.5 bg-green-500'
                  : i < step
                  ? 'w-1.5 h-1.5 bg-green-300'
                  : 'w-1.5 h-1.5 bg-gray-200'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-400 tabular-nums">{step + 1} / {STEPS.length}</span>
      </div>

      {/* ── Body — takes all remaining height ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 min-h-0">
        <div className="w-full max-w-md flex flex-col min-h-0 h-full">

          {/* Animated wrapper — fills available space */}
          <div
            className="flex flex-col min-h-0 flex-1"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : `translateY(${dir * 10}px)`,
              transition: 'opacity 0.18s ease, transform 0.18s ease',
            }}
          >
            {/* ── Step header — fixed height ── */}
            <div className="shrink-0 mb-3">
              <div className="flex items-center gap-2.5 mb-0.5">
                <span className="text-xl leading-none">{STEPS[step].emoji}</span>
                <h1 className="text-lg font-semibold text-gray-900 leading-tight">
                  {step === 0
                    ? `Hi ${user.given_name ?? user.name}! Let's start`
                    : STEPS[step].title}
                </h1>
              </div>
              <p className="text-xs text-gray-400 ml-9">{STEPS[step].sub}</p>
            </div>

            {/* ── Card — flex-1 so it fills remaining space, scrolls internally ── */}
            <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-100 overflow-y-auto mb-3">
              <div className="p-4">
                {step === 0 && <Step1Transport data={data} update={update} />}
                {step === 1 && <Step2Energy data={data} update={update} />}
                {step === 2 && <Step3Diet data={data} update={update} />}
                {step === 3 && <Step4Shopping data={data} update={update} />}
                {step === 4 && <StepDone />}
              </div>
            </div>

            {/* ── Buttons — fixed height ── */}
            <div className="shrink-0 flex gap-2">
              {step > 0 && (
                <button
                  onClick={() => go(step - 1, -1)}
                  className="px-5 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => go(step + 1, 1)}
                  className="flex-1 py-2.5 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={loading}
                  className="flex-1 py-2.5 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      <LoadingText />
                    </>
                  ) : (
                    'See my action plan'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingText() {
  const msgs = [
    'Calculating footprint…',
    'Analysing lifestyle…',
    'Building action plan…',
    'Almost ready…',
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((c) => (c + 1) % msgs.length), 3000);
    return () => clearInterval(t);
  }, []);
  return <span>{msgs[i]}</span>;
}

// ── Shared components ─────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
      {children}
    </p>
  );
}

function OptionGrid({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string; sub?: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`p-2.5 rounded-xl border text-left transition-all ${
            value === o.value
              ? 'bg-green-600 border-green-600 text-white'
              : 'bg-white text-gray-700 hover:border-gray-300'
          }`}
          style={{ borderColor: value === o.value ? undefined : '#e5e7eb' }}
        >
          <p className="text-sm font-medium leading-tight">{o.label}</p>
          {o.sub && (
            <p
              className={`text-xs mt-0.5 leading-tight ${
                value === o.value ? 'text-green-100' : 'text-gray-400'
              }`}
            >
              {o.sub}
            </p>
          )}
        </button>
      ))}
    </div>
  );
}

function Slider({
  label, value, min, max, unit, onChange, hint,
}: {
  label: string; value: number; min: number; max: number;
  unit: string; onChange: (v: number) => void; hint?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <div>
          <p className="text-sm font-medium text-gray-800 leading-tight">{label}</p>
          {hint && <p className="text-xs text-gray-400">{hint}</p>}
        </div>
        <span className="text-sm font-semibold text-green-600 tabular-nums">
          {value} <span className="text-xs font-normal text-gray-400">{unit}</span>
        </span>
      </div>
      <div className="relative h-1.5 bg-gray-100 rounded-full mb-1">
        <div
          className="absolute inset-y-0 left-0 bg-green-500 rounded-full"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range" min={min} max={max} value={value} step={1}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ height: '100%' }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-300">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

// ── Step components ───────────────────────────────────────────────

function Step1Transport({ data, update }: { data: FormData; update: any }) {
  return (
    <div className="space-y-3.5">
      <div>
        <Label>Car type</Label>
        <OptionGrid
          value={data.carType}
          onChange={(v) => update('carType', v)}
          options={[
            { value: 'none',     label: '🚶 No car',       sub: 'Walk / cycle / bus' },
            { value: 'electric', label: '⚡ Electric',      sub: 'EV or plugin hybrid' },
            { value: 'hybrid',   label: '🔋 Hybrid',        sub: 'Petrol + electric' },
            { value: 'petrol',   label: '⛽ Petrol/Diesel',  sub: 'Standard car' },
          ]}
        />
      </div>
      {data.carType !== 'none' && (
        <Slider
          label="Weekly driving" value={data.kmPerWeek} min={0} max={1000} unit="km/wk"
          onChange={(v) => update('kmPerWeek', v)} hint="Commute + errands"
        />
      )}
      <Slider
        label="Flights per year" value={data.flightsPerYear} min={0} max={30} unit="return flights"
        onChange={(v) => update('flightsPerYear', v)}
      />
    </div>
  );
}

function Step2Energy({ data, update }: { data: FormData; update: any }) {
  return (
    <div className="space-y-3.5">
      <div>
        <Label>Energy source</Label>
        <OptionGrid
          value={data.energySource}
          onChange={(v) => update('energySource', v)}
          options={[
            { value: 'renewable', label: '🌱 Renewable',  sub: 'Solar, wind, hydro' },
            { value: 'grid',      label: '🔌 Grid mix',   sub: 'Standard electricity' },
            { value: 'gas',       label: '🔥 Mostly gas', sub: 'Gas boiler / heating' },
            { value: 'coal',      label: '🪨 Coal heavy', sub: 'High carbon grid' },
          ]}
        />
      </div>
      <div>
        <Label>Home size</Label>
        <OptionGrid
          value={data.homeSize}
          onChange={(v) => update('homeSize', v)}
          options={[
            { value: 'shared', label: '🏢 Shared',      sub: 'Flatmate / dorm' },
            { value: 'small',  label: '🏠 Small flat',  sub: 'Studio / 1-bed' },
            { value: 'medium', label: '🏡 Medium home', sub: '2–3 bed house' },
            { value: 'large',  label: '🏘️ Large home', sub: '4+ bed house' },
          ]}
        />
      </div>
    </div>
  );
}

function Step3Diet({ data, update }: { data: FormData; update: any }) {
  return (
    <div className="space-y-3.5">
      <div>
        <Label>Diet type</Label>
        <OptionGrid
          value={data.dietType}
          onChange={(v) => update('dietType', v)}
          options={[
            { value: 'vegan',      label: '🌱 Vegan',      sub: 'No animal products' },
            { value: 'vegetarian', label: '🥦 Vegetarian', sub: 'No meat or fish' },
            { value: 'omnivore',   label: '🍗 Omnivore',   sub: 'Mix of everything' },
            { value: 'heavy-meat', label: '🥩 Heavy meat', sub: 'Meat every day' },
          ]}
        />
      </div>
      <Slider
        label="Meat meals per week" value={data.meatPerWeek} min={0} max={21} unit="meals"
        onChange={(v) => update('meatPerWeek', v)} hint="Beef & lamb have most impact"
      />
    </div>
  );
}

function Step4Shopping({ data, update }: { data: FormData; update: any }) {
  return (
    <div className="space-y-4">
      <Slider
        label="New clothes per year" value={data.newClothesPerYear} min={0} max={100} unit="items"
        onChange={(v) => update('newClothesPerYear', v)} hint="Fast fashion has high emissions"
      />
      <Slider
        label="Online orders per month" value={data.onlineOrdersPerMonth} min={0} max={60} unit="orders"
        onChange={(v) => update('onlineOrdersPerMonth', v)} hint="Delivery + packaging"
      />
    </div>
  );
}

function StepDone() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: '🤖', label: 'AI analysis' },
          { icon: '📊', label: 'CO₂ score' },
          { icon: '🎯', label: 'Action plan' },
        ].map((item) => (
          <div key={item.label} className="bg-gray-50 rounded-xl p-3 text-center">
            <span className="text-xl block mb-1">{item.icon}</span>
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 leading-relaxed">
        Gemini will analyse your responses and generate a personalised carbon reduction plan in about 15 seconds.
      </p>
      <div className="flex items-start gap-2 bg-green-50 rounded-xl p-3 border border-green-100">
        <span className="text-green-600 shrink-0 mt-0.5 text-sm">💡</span>
        <p className="text-xs text-green-700 leading-relaxed">
          EcoAgent remembers your profile so you can ask follow-up questions and get weekly check-ins.
        </p>
      </div>
    </div>
  );
}