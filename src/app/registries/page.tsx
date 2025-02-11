'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../authcontext'
import { useApi } from '../hooks/useApi'

type Registry = {
  id: number
  name: string
}

export default function RegistriesPage() {
  const [registries, setRegistries] = useState<Registry[]>([])
  const [newName, setNewName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const {auth, isLoading: authLoading}  = useAuth();
  const { fetchWithAuth } = useApi()

  const fetchRegistries = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchWithAuth('/api/registries')
      setRegistries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }

  }

  useEffect(() => {
    if(authLoading) return
    if(!auth) {
      setIsLoading(false)
      return
    }
    fetchRegistries()

  }, [auth, authLoading])

  // Create a new registry
  async function createRegistry(e: React.FormEvent) {
    e.preventDefault()
    if (!newName || !auth) return

    setIsLoading(true)
    try {
      setError(null)
      
      const data = await fetchWithAuth('/api/registries', {
        method: 'POST',
        body: { "name": newName },
      })

      setRegistries(prev => [...prev, data])
      setNewName('')
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false) 
    }
  }

  if (authLoading || isLoading) {
    return <p>Loading...</p>
  }

  if (!auth) {
    return <p>You need to be logged in to view this page</p>
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Registries</h1>
      {
        error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )
      }
      <ul className="space-y-2">
        {registries.map(reg => (
          <li key={reg.id} className="p-2 border border-gray-300 rounded">
            #{reg.id} - {reg.name}
          </li>
        ))}
      </ul>

      <hr className="my-4" />

      <h2 className="text-xl font-semibold">Create New Registry</h2>
      <form onSubmit={createRegistry} className="flex items-center space-x-2">
        <input
          className="border p-1"
          type="text"
          placeholder="Registry name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          disabled={!newName || isLoading || newName.length < 2}
        >
          {isLoading ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  )
}