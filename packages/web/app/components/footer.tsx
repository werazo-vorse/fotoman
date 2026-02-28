import Link from 'next/link'

const LEGAL_REFS = [
  'Ley 1843/2017',
  'Sentencia C-038/2020',
  'Sentencia C-321/2022',
  'Art. 161 CNT',
]

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">
                <svg className="h-3.5 w-3.5 text-white" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-900">Fotoman</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-gray-400">
              Defensa legal automatizada contra fotomultas. Cali, Colombia.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Navegacion</p>
            <div className="flex flex-col gap-2">
              <Link href="/consulta" className="text-sm text-gray-500 transition-colors hover:text-gray-900">Consultar fotomultas</Link>
              <Link href="/panel" className="text-sm text-gray-500 transition-colors hover:text-gray-900">Mis casos</Link>
              <Link href="/chat" className="text-sm text-gray-500 transition-colors hover:text-gray-900">Asistente</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Marco legal</p>
            <div className="flex flex-wrap gap-2">
              {LEGAL_REFS.map((ref) => (
                <span key={ref} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
                  {ref}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
          <p>Fotoman &copy; {new Date().getFullYear()} &mdash; Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  )
}
