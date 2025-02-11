'use client'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="p-4 bg-gray-200">
      <Link href="/" className="mr-4">Home</Link>
      <Link href="/registries" className="mr-4">Registries</Link>
      <Link href="/cash_counts" className="mr-4">Cash Counts</Link>
      <Link href="/cash_counts/new" className="mr-4">New Cash Count</Link>
      <Link href="/login" className="mr-4">Login</Link>
    </nav>
  )
}