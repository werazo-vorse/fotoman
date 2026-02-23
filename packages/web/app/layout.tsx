import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fotoman - Defensa contra fotomultas',
  description: 'Asistente legal AI para impugnar fotomultas en Cali, Colombia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  )
}
