import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="max-w-lg text-center">
        <div className="text-5xl mb-6">🌍</div>
        <h1 className="text-4xl font-semibold text-gray-900 mb-4">
          EcoAgents
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          Your personal AI agent that monitors your carbon footprint
          and helps you take action — one step at a time.
        </p>
         <Link
          href="/api/auth/login?returnTo=/onboarding"
          className="inline-block bg-green-600 text-white px-8 py-3 rounded-xl text-base font-medium hover:bg-green-700 transition-colors"
        >
          Get started
        </Link>
      </div>
    </main>
  );
}