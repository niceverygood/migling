import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './components/Home'
import LoginButton from './components/LoginButton'
import CharacterList from './components/CharacterList'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex space-x-8 items-center">
                <Link to="/" className="text-xl font-bold text-gray-900">
                  Mingling
                </Link>
                <Link to="/" className="text-gray-500 hover:text-gray-900">
                  Home
                </Link>
                <Link to="/characters" className="text-gray-500 hover:text-gray-900">
                  Characters
                </Link>
                <Link to="/login" className="text-gray-500 hover:text-gray-900">
                  Login
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginButton />} />
            <Route path="/characters" element={<CharacterList />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
