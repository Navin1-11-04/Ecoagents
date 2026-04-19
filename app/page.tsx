import Logo from '@/components/Logo';

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="px-6 sm:px-10 py-5 flex items-center justify-between border-b border-gray-100">
        <Logo size="md" />
        <div className="flex items-center gap-6">
          <a href="/auth/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Sign in
          </a>
          <a
            href="/auth/login?returnTo=/onboarding"
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Get started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-20 sm:py-32">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          Earth Day Edition · DEV Challenge 2026
        </div>

        <h1 className="text-4xl sm:text-6xl font-semibold text-gray-900 mb-6 leading-[1.1] tracking-tight max-w-2xl">
          Know your footprint.<br />
          <span className="text-green-600">Take action.</span>
        </h1>

        <p className="text-lg text-gray-500 mb-10 max-w-md leading-relaxed">
          An AI agent that analyses your carbon footprint,
          builds your personal action plan, and checks in every week.
        </p>

        <a
          href="/auth/login?returnTo=/onboarding"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-7 py-3.5 rounded-xl text-base font-medium hover:bg-green-700 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
        >
          Calculate my footprint
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
        <p className="text-xs text-gray-400 mt-3">Free · 2 minutes · No credit card</p>
      </div>

      {/* How it works */}
      <div className="border-t border-gray-100 px-6 sm:px-10 py-16 sm:py-20">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-12">
          How it works
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            {
              step: '01',
              title: 'Answer 4 questions',
              desc: 'Tell us about your transport, energy, diet, and shopping habits.',
            },
            {
              step: '02',
              title: 'Get your AI plan',
              desc: 'Gemini analyses your data and builds a ranked action plan specific to you.',
            },
            {
              step: '03',
              title: 'Your agent checks in',
              desc: 'EcoAgent remembers your profile and emails you weekly progress updates.',
            },
          ].map((item) => (
            <div key={item.step} className="flex flex-col gap-3">
              <span className="text-xs font-mono font-semibold text-green-600">{item.step}</span>
              <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Powered by */}
      <div className="border-t border-gray-100 px-6 py-5 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
        {[
          'Auth0 for Agents',
          'Google Gemini',
          'Backboard Memory',
          'GitHub Copilot',
        ].map((tech) => (
          <span key={tech} className="text-xs text-gray-400">{tech}</span>
        ))}
      </div>
    </main>
  );
}