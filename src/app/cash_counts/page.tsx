'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../authcontext'
import { useApi } from '../hooks/useApi'

interface CashCount {
  id: number
  registry_id: number
  date_counted: string
  reported_amount: number
  actual_total: number
  leftover_total: number
  over_short: number
  note: string
}

export default function CashCountsPage() {
  const [counts, setCounts] = useState<CashCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { auth, isLoading: authLoading } = useAuth()
  const { fetchWithAuth } = useApi()

  useEffect(() => {
    if (authLoading) return
    if (!auth) {
      setIsLoading(false)
      return
    }

    const fetchCashCounts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchWithAuth('/api/cash_counts')
        setCounts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cash counts')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCashCounts()
  }, [auth, authLoading])

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!auth) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600">Please log in to view cash counts</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">All Cash Counts</h1>
      
      {counts.length === 0 ? (
        <p className="text-gray-500">No cash counts found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">ID</th>
                <th className="border p-2">Registry ID</th>
                <th className="border p-2">Date Counted</th>
                <th className="border p-2">Reported</th>
                <th className="border p-2">Actual</th>
                <th className="border p-2">Leftover</th>
                <th className="border p-2">Over/Short</th>
                <th className="border p-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {counts.map(cc => (
                <tr key={cc.id} className="hover:bg-gray-50">
                  <td className="border p-2 text-center">{cc.id}</td>
                  <td className="border p-2 text-center">{cc.registry_id}</td>
                  <td className="border p-2">
                    {new Date(cc.date_counted).toLocaleString()}
                  </td>
                  <td className="border p-2 text-right">
                    {cc.reported_amount.toFixed(2)}
                  </td>
                  <td className="border p-2 text-right">
                    {cc.actual_total.toFixed(2)}
                  </td>
                  <td className="border p-2 text-right">
                    {cc.leftover_total.toFixed(2)}
                  </td>
                  <td className={`border p-2 text-right ${
                    cc.over_short < 0 ? 'text-red-600' : 
                    cc.over_short > 0 ? 'text-green-600' : ''
                  }`}>
                    {cc.over_short.toFixed(2)}
                  </td>
                  <td className="border p-2">{cc.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}