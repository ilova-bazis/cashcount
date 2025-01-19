'use client' // app/registries/page.tsx

import { useEffect, useState } from 'react'

type Registry = {
  id: number
  name: string
}

export default function RegistriesPage() {
  const [registries, setRegistries] = useState<Registry[]>([])
  const [newName, setNewName] = useState('')

  // If you set up an env var:
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

  // Fetch registries on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/registries`)
      .then(res => res.json())
      .then(data => setRegistries(data))
      .catch(console.error)
  }, [API_BASE])

  // Create a new registry
  async function createRegistry(e: React.FormEvent) {
    e.preventDefault()
    if (!newName) return

    try {
      const res = await fetch(`${API_BASE}/api/registries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      })
      if (!res.ok) {
        console.error('Error creating registry')
        return
      }
      const data = await res.json()
      setRegistries(prev => [...prev, data])
      setNewName('')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Registries</h1>

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
        >
          Create
        </button>
      </form>
    </div>
  )
}