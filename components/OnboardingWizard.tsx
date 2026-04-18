'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  { id: 'transport', label: 'Transport',    emoji: '✈️' },
  { id: 'energy',    label: 'Home Energy',  emoji: '⚡' },
  { id: 'diet',      label: 'Diet',         emoji: '🥗' },
  { id: 'shopping',  label: 'Shopping',     emoji: '🛍️' },
  { id: 'done',      label: 'Ready',        emoji: '🌿' },
];

export default function OnboardingWizard({ user }: { user: any }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(initialData);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const update = (field: keyof FormData, value: any) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const animateStep = (nextStep: number, dir: 'forward' | 'back') => {
    setDirection(dir);
    setVisible(false);
    setTimeout(() => {
      setStep(nextStep);
      setVisible(true);
    }, 200);
  };

  const next = () => animateStep(Math.min(step + 1, STEPS.length - 1), 'forward');
  const back = () => animateStep(Math.max(step - 1, 0), 'back');

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const text = await res.text();
      if (!text) throw new Error('Empty response');
      const result = JSON.parse(text);
      if (result.success) router.push('/dashboard');
    } catch (e) {
      console.error(e);
      alert('Something went wrong. Check the console.');
    } finally {
      setLoading(false);
    }
  };

  const progressPct = Math.round((step / (STEPS.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col">
      {/* Nav */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌍</span>
          <span className="font-semibold text-gray-900 text-sm">EcoAgents</span>
        </div>
        <span className="text-xs text-gray-400">
          Step {step + 1} of {STEPS.length}
        </span>
      </div>

      {/* Step indicator dots */}
      <div className="flex justify-center gap-2 pt-2 pb-6">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`transition-all duration-300 rounded-full ${
              i === step
                ? 'w-6 h-2 bg-green-500'
                : i < step
                ? 'w-2 h-2 bg-green-300'
                : 'w-2 h-2 bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Main card */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-10">
        <div className="w-full max-w-md">
          {/* Animated step content */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible
                ? 'translateY(0px)'
                : direction === 'forward'
                ? 'translateY(16px)'
                : 'translateY(-16px)',
              transition: 'opacity 0.2s ease, transform 0.2s ease',
            }}
          >
            {/* Step emoji + title */}
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">{STEPS[step].emoji}</div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {step === 0 && `Hi ${user.given_name ?? user.name}! Let's start`}
                {step === 1 && 'Your home energy'}
                {step === 2 && 'What do you eat?'}
                {step === 3 && 'Shopping habits'}
                {step === 4 && "You're all set!"}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {step === 0 && 'How do you get around?'}
                {step === 1 && 'How do you power your home?'}
                {step === 2 && 'Your diet has a big impact'}
                {step === 3 && 'Last one — almost there'}
                {step === 4 && 'Your AI agent is ready to analyse your footprint'}
              </p>
            </div>

            {/* Step content */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
              {step === 0 && <Step1Transport data={data} update={update} />}
              {step === 1 && <Step2Energy data={data} update={update} />}
              {step === 2 && <Step3Diet data={data} update={update} />}
              {step === 3 && <Step4Shopping data={data} update={update} />}
              {step === 4 && <StepDone />}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              {step > 0 && (
                <button
                  onClick={back}
                  className="flex-none px-5 py-3 text-sm text-gray-500 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button
                  onClick={next}
                  className="flex-1 py-3 text-sm bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-colors font-medium shadow-sm"
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={loading}
                  className="flex-1 py-3 text-sm bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-colors font-medium shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Analysing your footprint…
                    </>
                  ) : (
                    'See my action plan →'
                  )}
                </button>
              )}
            </div>

            {/* Loading state detail */}
            {loading && (
              <div className="mt-4 text-center">
                <LoadingSteps />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Loading animation while Gemini analyses ──────────────────────

function LoadingSteps() {
  const steps = [
    'Calculating your carbon footprint…',
    'Analysing your lifestyle data…',
    'Building your action plan…',
    'Preparing your dashboard…',
  ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % steps.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <p
      key={current}
      className="text-xs text-gray-400 animate-pulse"
      style={{ transition: 'opacity 0.3s' }}
    >
      {steps[current]}
    </p>
  );
}

// ── Shared input components ───────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
      {children}
    </p>
  );
}

function OptionGrid({
  value,
  options,
  onChange,
  cols = 2,
}: {
  value: string;
  options: { value: string; label: string; sub?: string }[];
  onChange: (v: string) => void;
  cols?: number;
}) {
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`p-3 rounded-2xl border text-left transition-all ${
            value === o.value
              ? 'bg-green-600 border-green-600 text-white shadow-sm scale-[1.02]'
              : 'bg-gray-50 border-gray-100 text-gray-700 hover:border-green-300 hover:bg-green-50'
          }`}
        >
          <p className="text-sm font-medium leading-tight">{o.label}</p>
          {o.sub && (
            <p className={`text-xs mt-0.5 ${value === o.value ? 'text-green-100' : 'text-gray-400'}`}>
              {o.sub}
            </p>
          )}
        </button>
      ))}
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  unit,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
  hint?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-1">
      <div className="flex justify-between items-end mb-2">
        <div>
          <p className="text-sm font-medium text-gray-700">{label}</p>
          {hint && <p className="text-xs text-gray-400">{hint}</p>}
        </div>
        <span className="text-lg font-semibold text-green-600 tabular-nums">
          {value}
          <span className="text-xs font-normal text-gray-400 ml-1">{unit}</span>
        </span>
      </div>
      <div className="relative h-2 bg-gray-100 rounded-full">
        <div
          className="absolute top-0 left-0 h-2 bg-green-400 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          step={1}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
        />
      </div>
      <div className="flex justify-between text-xs text-gray-300 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

// ── Step components ───────────────────────────────────────────────

function Step1Transport({ data, update }: { data: FormData; update: any }) {
  return (
    <div className="space-y-5">
      <div>
        <SectionLabel>Car type</SectionLabel>
        <OptionGrid
          value={data.carType}
          onChange={(v) => update('carType', v)}
          options={[
            { value: 'none',     label: '🚶 No car',      sub: 'Walk / cycle / transit' },
            { value: 'electric', label: '⚡ Electric',     sub: 'EV or plugin hybrid' },
            { value: 'hybrid',   label: '🔋 Hybrid',       sub: 'Petrol + electric' },
            { value: 'petrol',   label: '⛽ Petrol/Diesel', sub: 'Standard ICE car' },
          ]}
        />
      </div>
      {data.carType !== 'none' && (
        <SliderField
          label="Weekly driving distance"
          value={data.kmPerWeek}
          min={0} max={1000} unit="km/wk"
          onChange={(v) => update('kmPerWeek', v)}
          hint="Typical commute + errands"
        />
      )}
      <SliderField
        label="Return flights per year"
        value={data.flightsPerYear}
        min={0} max={30} unit="flights"
        onChange={(v) => update('flightsPerYear', v)}
        hint="Each return flight = 1"
      />
    </div>
  );
}

function Step2Energy({ data, update }: { data: FormData; update: any }) {
  return (
    <div className="space-y-5">
      <div>
        <SectionLabel>Energy source</SectionLabel>
        <OptionGrid
          value={data.energySource}
          onChange={(v) => update('energySource', v)}
          options={[
            { value: 'renewable', label: '🌱 Renewable',   sub: 'Solar, wind, hydro' },
            { value: 'grid',      label: '🔌 Grid mix',    sub: 'Standard electricity' },
            { value: 'gas',       label: '🔥 Mostly gas',  sub: 'Gas boiler / heating' },
            { value: 'coal',      label: '🪨 Coal heavy',  sub: 'High carbon grid' },
          ]}
        />
      </div>
      <div>
        <SectionLabel>Home size</SectionLabel>
        <OptionGrid
          value={data.homeSize}
          onChange={(v) => update('homeSize', v)}
          cols={2}
          options={[
            { value: 'shared', label: '🏢 Shared space', sub: 'Flatmate / dorm' },
            { value: 'small',  label: '🏠 Small flat',   sub: 'Studio / 1-bed' },
            { value: 'medium', label: '🏡 Medium home',  sub: '2–3 bed house' },
            { value: 'large',  label: '🏘️ Large home',  sub: '4+ bed / detached' },
          ]}
        />
      </div>
    </div>
  );
}

function Step3Diet({ data, update }: { data: FormData; update: any }) {
  return (
    <div className="space-y-5">
      <div>
        <SectionLabel>Diet type</SectionLabel>
        <OptionGrid
          value={data.dietType}
          onChange={(v) => update('dietType', v)}
          options={[
            { value: 'vegan',      label: '🌱 Vegan',       sub: 'No animal products' },
            { value: 'vegetarian', label: '🥦 Vegetarian',  sub: 'No meat or fish' },
            { value: 'omnivore',   label: '🍗 Omnivore',    sub: 'Mix of everything' },
            { value: 'heavy-meat', label: '🥩 Heavy meat',  sub: 'Meat every day' },
          ]}
        />
      </div>
      <SliderField
        label="Meat meals per week"
        value={data.meatPerWeek}
        min={0} max={21} unit="meals"
        onChange={(v) => update('meatPerWeek', v)}
        hint="Beef & lamb have higher impact"
      />
    </div>
  );
}

function Step4Shopping({ data, update }: { data: FormData; update: any }) {
  return (
    <div className="space-y-5">
      <SliderField
        label="New clothes per year"
        value={data.newClothesPerYear}
        min={0} max={100} unit="items"
        onChange={(v) => update('newClothesPerYear', v)}
        hint="Fast fashion has high emissions"
      />
      <SliderField
        label="Online orders per month"
        value={data.onlineOrdersPerMonth}
        min={0} max={60} unit="orders"
        onChange={(v) => update('onlineOrdersPerMonth', v)}
        hint="Delivery + packaging impact"
      />
    </div>
  );
}

function StepDone() {
  return (
    <div className="text-center py-4 space-y-3">
      <div className="flex justify-center gap-6 text-sm text-gray-500">
        {[
          { icon: '🤖', label: 'AI Analysis' },
          { icon: '📊', label: 'Footprint Score' },
          { icon: '🎯', label: 'Action Plan' },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-1">
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 leading-relaxed pt-2">
        Gemini will analyse your data and build a personalised
        carbon reduction plan in about 15 seconds.
      </p>
      <div className="bg-green-50 rounded-2xl p-3 border border-green-100">
        <p className="text-xs text-green-700">
          💡 Your EcoAgent will remember your profile so you can ask follow-up questions anytime.
        </p>
      </div>
    </div>
  );
}