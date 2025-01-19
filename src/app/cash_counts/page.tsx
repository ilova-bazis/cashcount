'use client' // app/cash_counts/page.tsx

import { useEffect, useState } from 'react'

type CashCount = {
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
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

  useEffect(() => {
    fetch(`${API_BASE}/api/cash_counts`)
      .then(res => res.json())
      .then(data => setCounts(data))
      .catch(console.error)
  }, [API_BASE])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">All Cash Counts</h1>
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
            <tr key={cc.id}>
              <td className="border p-2 text-center">{cc.id}</td>
              <td className="border p-2 text-center">{cc.registry_id}</td>
              <td className="border p-2">
                {new Date(cc.date_counted).toLocaleString()}
              </td>
              <td className="border p-2">{cc.reported_amount}</td>
              <td className="border p-2">{cc.actual_total}</td>
              <td className="border p-2">{cc.leftover_total}</td>
              <td className="border p-2">{cc.over_short}</td>
              <td className="border p-2">{cc.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}