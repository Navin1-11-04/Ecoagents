export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌍</span>
          <span className="font-semibold text-gray-900">EcoAgents</span>
        </div>
        <a
          href="/auth/login"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Sign in
        </a>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center pb-16">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-green-200">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Earth Day Edition — DEV Challenge 2026
        </div>

        <h1 className="text-5xl font-semibold text-gray-900 mb-4 leading-tight max-w-lg">
          Your personal
          <span className="text-green-600"> planet agent</span>
        </h1>

        <p className="text-lg text-gray-500 mb-10 max-w-md leading-relaxed">
          EcoAgents analyses your carbon footprint, builds a personalised
          action plan, and remembers your progress — powered by Gemini AI.
        </p>

        <a
          href="/auth/login?returnTo=/onboarding"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-2xl text-base font-medium hover:bg-green-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          Calculate my footprint
          <span>→</span>
        </a>

        <p className="text-xs text-gray-400 mt-4">
          Free · Takes 2 minutes · No credit card
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-12">
          {[
            { icon: '🤖', label: 'Gemini AI analysis' },
            { icon: '🔐', label: 'Auth0 secure login' },
            { icon: '🧠', label: 'Backboard memory' },
            { icon: '🎯', label: 'Personalised actions' },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-3 py-1.5 text-xs text-gray-600 shadow-sm"
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom strip */}
      <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-center gap-6">
        {[
          { val: '4.6t', label: 'Avg footprint analysed' },
          { val: '6',    label: 'Actions per plan' },
          { val: '2min', label: 'Setup time' },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-base font-semibold text-gray-800">{s.val}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>
    </main>
  );
}