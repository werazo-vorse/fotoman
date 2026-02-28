const STEPS = [
  { key: 'consulta', label: 'Consulta' },
  { key: 'resultados', label: 'Resultados' },
  { key: 'pago', label: 'Pago' },
  { key: 'listo', label: 'Listo' },
]

export function StepProgress({ current }: { current: string }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current)

  return (
    <nav aria-label="Progreso del proceso" className="flex items-center justify-center gap-1 py-4 sm:gap-2">
      <ol className="flex items-center gap-1 sm:gap-2">
        {STEPS.map((step, i) => {
          const isDone = i < currentIdx
          const isCurrent = i === currentIdx
          const label = isDone ? `${step.label} (completado)` : isCurrent ? `${step.label} (paso actual)` : step.label
          return (
            <li key={step.key} className="flex items-center gap-1 sm:gap-2" aria-current={isCurrent ? 'step' : undefined}>
              <div className="flex items-center gap-1.5">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    isDone
                      ? 'bg-accent-500 text-white'
                      : isCurrent
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                  }`}
                  aria-label={label}
                >
                  {isDone ? (
                    <svg className="h-3.5 w-3.5" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`hidden text-xs font-medium sm:inline ${
                    isCurrent ? 'text-brand-700' : isDone ? 'text-accent-600' : 'text-gray-400'
                  }`}
                  aria-hidden="true"
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-6 sm:w-10 ${i < currentIdx ? 'bg-accent-400' : 'bg-gray-200'}`} aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
