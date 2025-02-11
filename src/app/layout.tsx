// import './globals.css'
// import Link from 'next/link'
// // import { Metadata } from 'next'
// import { AuthProvider } from './authcontext'
// export const metadata: Metadata = {
//   title: 'My Cash App',
//   description: 'Cash tracking system',
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en">
//       <body>
//         <nav className="p-4 bg-gray-200">
//           {/* Instead of <a href="/">Home</a>, use <Link href="/"> */}
//               <Link href="/" className="mr-4">Home</Link>
//               <Link href="/registries" className="mr-4">Registries</Link>
//               <Link href="/cash_counts" className="mr-4">Cash Counts</Link>
//               <Link href="/cash_counts/new" className="mr-4">New Cash Count</Link>
//               <Link href="/login" className="mr-4">Login</Link>
//         </nav>
//         <main className="p-4">
//           <AuthProvider>{
//               children
//           }</AuthProvider>
//         </main>
//       </body>
//     </html>
//   )
// }

import './globals.css'
import Navbar from './components/Navbar'
import { AuthProvider } from './authcontext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="p-4">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}