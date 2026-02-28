'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_LINKS = [
  { href: '/consulta', label: 'Consultar' },
  { href: '/panel', label: 'Mis Casos' },
  { href: '/chat', label: 'Asistente' },
]

export function Header() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [open, setOpen] = useState(false)

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors ${
        isHome
          ? 'border-brand-800/30 bg-brand-950/80'
          : 'border-gray-200 bg-white/80'
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 shadow-sm">
            <svg className="h-4 w-4 text-white" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <span className={`text-lg font-bold ${isHome ? 'text-white' : 'text-gray-900'}`}>
            Fotoman
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Navegacion principal" className="hidden gap-1 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? isHome
                    ? 'bg-brand-800/50 text-white'
                    : 'bg-brand-50 text-brand-700'
                  : isHome
                    ? 'text-brand-200/70 hover:bg-brand-800/30 hover:text-white'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors sm:hidden ${
            isHome ? 'text-brand-200 hover:bg-brand-800/30' : 'text-gray-500 hover:bg-gray-100'
          }`}
          aria-label="Menu de navegacion"
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? (
            <svg className="h-5 w-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Navegacion principal"
          className={`border-t px-4 pb-4 pt-2 sm:hidden ${
            isHome ? 'border-brand-800/30 bg-brand-950/95' : 'border-gray-100 bg-white/95'
          }`}
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? isHome
                      ? 'bg-brand-800/50 text-white'
                      : 'bg-brand-50 text-brand-700'
                    : isHome
                      ? 'text-brand-200 hover:bg-brand-800/30 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
