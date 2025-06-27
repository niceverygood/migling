import { useState, useEffect } from 'react'
import { api } from '../api'

interface Character {
  id: number
  name: string
  description: string
  createdAt: string
}

function CharacterList() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await api.get('/characters')
        setCharacters(response.data)
      } catch (err) {
        console.error('Failed to fetch characters:', err)
        setError('Failed to load characters. Make sure the backend server is running.')
      } finally {
        setLoading(false)
      }
    }

    fetchCharacters()
  }, [])

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading characters...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Characters</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all AI characters available for conversation.
          </p>
        </div>
      </div>
      
      {characters.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No characters found. Create one to get started!</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((character) => (
            <div key={character.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {character.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {character.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Created {new Date(character.createdAt).toLocaleDateString()}
                </span>
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                  Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CharacterList 