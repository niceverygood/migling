function Home() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Mingling
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          A social platform connecting people through shared interests and meaningful conversations.
        </p>
        <div className="space-x-4">
          <a 
            href="/characters" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Explore Characters
          </a>
          <a 
            href="/login" 
            className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  )
}

export default Home 