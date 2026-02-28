import type { Metadata } from 'next'
import { Header } from './components/header'
import { Footer } from './components/footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fotoman - Defensa contra fotomultas',
  description: 'Defensa legal automatizada para impugnar fotomultas en Cali, Colombia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col bg-gray-50 text-gray-900 antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
