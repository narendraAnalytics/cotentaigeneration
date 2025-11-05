export default function Home() {
  return (
    <div className="min-h-screen w-full bg-linear-to-br from-purple-50 via-blue-50 to-pink-50">
      <main className="flex min-h-screen w-full flex-col items-center justify-center px-8">
        {/* Hero Content */}
        <div className="text-center space-y-6">
          <h1 className="text-6xl md:text-7xl font-bold bg-linear-to-br from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
            AI Copywriting
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
            Generate beautiful blog content with AI
          </p>
        </div>
      </main>
    </div>
  );
}
