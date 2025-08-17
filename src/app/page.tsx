import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          🚀 Modern AI Chat Widget
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Complete T3 Stack implementation with Supabase, real-time features, voice processing, 
          and Schedule-X calendar integration for plumbing businesses.
        </p>
        
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-block bg-gradient-to-r from-green-600 to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl mb-8"
          >
            🚀 Open T3 Dashboard →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/test/widget"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200"
          >
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Widget Demo</h3>
            <p className="text-gray-600">
              Interactive chatbot widget with multi-language support, booking forms, and feedback system.
            </p>
          </Link>

          <Link
            href="/test/voice"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200"
          >
            <div className="text-4xl mb-4">🎙️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Voice Invoice</h3>
            <p className="text-gray-600">
              Speech-to-text invoice generation with Dutch plumbing terminology and BTW calculations.
            </p>
          </Link>

          <Link
            href="/test/integration"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200"
          >
            <div className="text-4xl mb-4">🧪</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Integration Tests</h3>
            <p className="text-gray-600">
              Comprehensive testing suite for database, real-time features, and multi-tenant security.
            </p>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">🏗️ Tech Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="font-semibold text-blue-900">Framework</div>
              <div className="text-blue-700">Next.js 15.4.6</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="font-semibold text-green-900">Database</div>
              <div className="text-green-700">Supabase</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="font-semibold text-purple-900">API</div>
              <div className="text-purple-700">tRPC v11</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="font-semibold text-orange-900">TypeScript</div>
              <div className="text-orange-700">Strict Mode</div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-gray-500 text-sm">
          <p>🎯 All components built with type-safe APIs, real-time subscriptions, and multi-tenant security</p>
        </div>
      </div>
    </main>
  );
}