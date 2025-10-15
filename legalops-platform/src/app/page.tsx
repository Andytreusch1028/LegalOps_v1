import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
          {/* Logo/Title */}
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
              LegalOps v1
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              Legal Operations Platform
            </p>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full mb-8">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-semibold">Database Connected</span>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-blue-50 rounded-xl">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="font-bold text-gray-900 mb-2">User Management</h3>
              <p className="text-sm text-gray-600">Complete user authentication and role-based access</p>
            </div>
            <div className="p-6 bg-purple-50 rounded-xl">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="font-bold text-gray-900 mb-2">Order Tracking</h3>
              <p className="text-sm text-gray-600">LLC/Corp formations and compliance services</p>
            </div>
            <div className="p-6 bg-pink-50 rounded-xl">
              <div className="text-4xl mb-3">📄</div>
              <h3 className="font-bold text-gray-900 mb-2">Document Management</h3>
              <p className="text-sm text-gray-600">Secure document storage and processing</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/users"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              🚀 View User Dashboard
            </Link>
            <Link
              href="/api/test-db"
              className="bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              🔌 Test API
            </Link>
          </div>

          {/* Tech Stack */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4 font-semibold">Built with</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <span className="bg-gray-100 px-4 py-2 rounded-full">Next.js 15</span>
              <span className="bg-gray-100 px-4 py-2 rounded-full">TypeScript</span>
              <span className="bg-gray-100 px-4 py-2 rounded-full">Prisma</span>
              <span className="bg-gray-100 px-4 py-2 rounded-full">PostgreSQL</span>
              <span className="bg-gray-100 px-4 py-2 rounded-full">Tailwind CSS</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white">
          <p className="text-sm opacity-90">
            © 2025 LegalOps v1 - Legal Operations Platform
          </p>
        </div>
      </div>
    </div>
  );
}
