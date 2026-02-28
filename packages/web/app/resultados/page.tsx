'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { LookupSession, UserData, FotomultaWithAnalysis } from '../components/session-store'
import { getLookup, saveCheckout } from '../components/session-store'
import { StepProgress } from '../components/step-progress'

const FEE_PER_FOTOMULTA = 5000000

const DEFENSE_INFO: Record<string, {
  name: string
  color: string
  bg: string
  ring: string
  iconBg: string
  strength: 'alta' | 'media' | 'baja'
  strengthLabel: string
  strengthPercent: number
  strengthColor: string
  barColor: string
  legalBasis: string
  explanation: string
  plainSummary: string
  consequence: string
}> = {
  'indebida-notificacion': {
    name: 'Indebida Notificacion',
    color: 'text-red-700',
    bg: 'bg-red-50',
    ring: 'ring-red-100',
    iconBg: 'bg-red-100 text-red-600',
    strength: 'alta',
    strengthLabel: 'Alta probabilidad',
    strengthPercent: 90,
    strengthColor: 'text-accent-600',
    barColor: 'bg-accent-500',
    legalBasis: 'Art. 8, Ley 1843/2017',
    explanation: 'La autoridad debe notificar la infraccion dentro de los 13 dias habiles siguientes. Si no lo hizo, la sancion es invalida por violacion al debido proceso.',
    plainSummary: 'Le avisaron tarde o no le avisaron. La multa se puede anular.',
    consequence: 'Nulidad de la resolucion sancionatoria',
  },
  'conductor-no-identificado': {
    name: 'Conductor No Identificado',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    ring: 'ring-orange-100',
    iconBg: 'bg-orange-100 text-orange-600',
    strength: 'alta',
    strengthLabel: 'Alta probabilidad',
    strengthPercent: 85,
    strengthColor: 'text-accent-600',
    barColor: 'bg-accent-500',
    legalBasis: 'Sentencia C-038/2020, Corte Constitucional',
    explanation: 'La camara capta la placa, no al conductor. La Corte Constitucional declaro inconstitucional la responsabilidad solidaria: el Estado debe identificar a quien conducia.',
    plainSummary: 'No pueden multarlo solo porque el carro es suyo. Deben probar que usted conducia.',
    consequence: 'Imposibilidad de sancionar al propietario',
  },
  caducidad: {
    name: 'Caducidad',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    ring: 'ring-purple-100',
    iconBg: 'bg-purple-100 text-purple-600',
    strength: 'alta',
    strengthLabel: 'Alta probabilidad',
    strengthPercent: 95,
    strengthColor: 'text-accent-600',
    barColor: 'bg-accent-500',
    legalBasis: 'Art. 161, Codigo Nacional de Transito',
    explanation: 'Si ha pasado mas de 1 año desde la infraccion sin que se haya notificado una resolucion sancionatoria, el proceso ha caducado.',
    plainSummary: 'Paso mas de un año sin resolucion. La multa vencio.',
    consequence: 'Extincion del proceso sancionatorio',
  },
  prescripcion: {
    name: 'Prescripcion',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    ring: 'ring-indigo-100',
    iconBg: 'bg-indigo-100 text-indigo-600',
    strength: 'alta',
    strengthLabel: 'Alta probabilidad',
    strengthPercent: 90,
    strengthColor: 'text-accent-600',
    barColor: 'bg-accent-500',
    legalBasis: 'Art. 159, Ley 769/2002',
    explanation: 'Si han pasado mas de 3 años desde que la resolucion quedo en firme sin inicio de cobro coactivo, la sancion ha prescrito.',
    plainSummary: 'Pasaron mas de 3 años sin cobrar. Ya no pueden ejecutar el pago.',
    consequence: 'Imposibilidad de cobro coactivo',
  },
  'vicios-tecnicos': {
    name: 'Vicios Tecnicos',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    ring: 'ring-yellow-100',
    iconBg: 'bg-yellow-100 text-yellow-600',
    strength: 'media',
    strengthLabel: 'Probabilidad media',
    strengthPercent: 55,
    strengthColor: 'text-yellow-600',
    barColor: 'bg-yellow-400',
    legalBasis: 'Resolucion 718/2018, MinTransporte',
    explanation: 'La camara debe estar señalizada (visible a 500m), con autorizacion del MinTransporte y certificado de calibracion vigente.',
    plainSummary: 'La camara puede no cumplir con los requisitos legales.',
    consequence: 'Invalidez de la prueba fotografica',
  },
}

const STRENGTH_ORDER: Record<string, number> = { alta: 0, media: 1, baja: 2 }

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Sin registro'
  return new Date(dateStr).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
}

function DefenseCard({ defenseKey, count, total }: { defenseKey: string; count: number; total: number }) {
  const info = DEFENSE_INFO[defenseKey]
  if (!info) return null

  return (
    <div className={`rounded-2xl ${info.bg} p-5 ring-1 ${info.ring}`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${info.iconBg}`}>
            <svg className="h-4.5 w-4.5" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <span className={`text-sm font-bold ${info.color}`}>{info.name}</span>
        </div>
        <span className="shrink-0 text-xs text-gray-400">{count}/{total}</span>
      </div>

      <p className="mb-3 text-sm font-medium text-gray-700">{info.plainSummary}</p>

      {/* Strength bar */}
      <div className="mb-2">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className={`font-bold ${info.strengthColor}`}>{info.strengthLabel}</span>
          <span className="text-gray-400">{info.strengthPercent}%</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={info.strengthPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Probabilidad de exito: ${info.strengthPercent}%`}
          className="h-2 overflow-hidden rounded-full bg-white/60"
        >
          <div className={`h-full rounded-full ${info.barColor} transition-all`} style={{ width: `${info.strengthPercent}%` }} />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
        <svg className="h-3 w-3 shrink-0" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
        {info.legalBasis}
      </div>
    </div>
  )
}

function FotomultaCard({
  fotomulta,
  index,
  isSelected,
  onToggle,
}: {
  fotomulta: FotomultaWithAnalysis
  index: number
  isSelected: boolean
  onToggle: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const sortedDefenses = [...fotomulta.applicableDefenses].sort(
    (a, b) => (STRENGTH_ORDER[DEFENSE_INFO[a]?.strength ?? 'baja'] ?? 2) - (STRENGTH_ORDER[DEFENSE_INFO[b]?.strength ?? 'baja'] ?? 2),
  )

  return (
    <div
      className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-brand-500 shadow-md shadow-brand-100'
          : 'ring-gray-200 hover:ring-gray-300'
      }`}
    >
      <div className="flex cursor-pointer items-start gap-3 p-5" onClick={onToggle}>
        <div
          role="checkbox"
          aria-checked={isSelected}
          aria-label={`Seleccionar fotomulta ${index + 1}: ${fotomulta.infractionCode}`}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggle() } }}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
          isSelected ? 'border-brand-500 bg-brand-500' : 'border-gray-300 bg-white'
        }`}>
          {isSelected && (
            <svg className="h-3 w-3 text-white" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-400">Fotomulta {index + 1}</p>
              <p className="mt-0.5 text-sm font-bold text-gray-900">
                {fotomulta.infractionCode} &mdash; {fotomulta.infractionDescription}
              </p>
            </div>
            <p className="shrink-0 text-lg font-extrabold text-gray-900">{formatCOP(fotomulta.amount)}</p>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
            <span>Infraccion: <span className="font-medium text-gray-700">{formatDate(fotomulta.infractionDate)}</span></span>
            <span>
              Notificacion:{' '}
              <span className={`font-medium ${fotomulta.notificationDate ? 'text-gray-700' : 'text-red-600'}`}>
                {formatDate(fotomulta.notificationDate)}
              </span>
            </span>
            {fotomulta.notificationBusinessDays !== null && (
              <span className={`font-bold ${fotomulta.notificationBusinessDays > 13 ? 'text-red-600' : 'text-accent-600'}`}>
                {fotomulta.notificationBusinessDays} dias habiles
                {fotomulta.notificationBusinessDays > 13 ? ' (excede plazo)' : ''}
              </span>
            )}
            {fotomulta.notificationBusinessDays === null && fotomulta.notificationDate === null && (
              <span className="font-bold text-red-600">Sin notificacion</span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {sortedDefenses.map((d) => {
              const info = DEFENSE_INFO[d]
              if (!info) return null
              return (
                <span
                  key={d}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${info.bg} ${info.color} ring-1 ${info.ring}`}
                >
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${info.barColor}`} />
                  {info.name}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 px-5 py-2">
        <button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="flex w-full items-center justify-between py-1 text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          <span>{expanded ? 'Ocultar detalle' : 'Ver detalle legal'}</span>
          <svg className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-3">
          <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-gray-400">Comparendo</p>
              <p className="font-mono font-medium text-gray-700">{fotomulta.comparendoNumber}</p>
            </div>
            <div>
              <p className="text-gray-400">Resolucion</p>
              <p className="font-mono font-medium text-gray-700">{fotomulta.resolutionNumber ?? 'Sin resolucion'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400">Ubicacion camara</p>
              <p className="font-medium text-gray-700">{fotomulta.cameraLocation}</p>
            </div>
          </div>

          <h4 className="mb-2 text-xs font-bold text-gray-700">Defensas aplicables</h4>
          <div className="space-y-2">
            {sortedDefenses.map((d) => {
              const info = DEFENSE_INFO[d]
              if (!info) return null
              return (
                <div key={d} className={`rounded-xl ${info.bg} p-3 ring-1 ${info.ring}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${info.color}`}>{info.name}</span>
                    <span className={`text-xs font-bold ${info.strengthColor}`}>{info.strengthLabel}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-600">{info.explanation}</p>
                  <p className="mt-1 text-xs text-gray-400">Resultado: {info.consequence}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ResultadosPage() {
  const router = useRouter()
  const [lookup, setLookup] = useState<LookupSession | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [userData, setUserData] = useState<UserData>({
    name: '', cedula: '', cedulaCity: 'Cali', email: '', phone: '', address: '', city: 'Santiago de Cali',
  })

  useEffect(() => {
    const data = getLookup()
    if (!data) { router.replace('/consulta'); return }
    setLookup(data)
    setSelected(new Set(data.fotomultas.map((f) => f.comparendoNumber)))
    setUserData((prev) => ({ ...prev, name: data.ownerName, cedula: data.cedula }))
  }, [router])

  if (!lookup) return null

  function toggleSelect(comparendo: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(comparendo)) next.delete(comparendo)
      else next.add(comparendo)
      return next
    })
  }

  function handleProceed() {
    if (selected.size === 0) return
    setShowForm(true)
    setTimeout(() => document.getElementById('user-form')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault()
    if (!lookup) return
    saveCheckout({
      lookup,
      selectedComparendos: Array.from(selected),
      feePerFotomulta: FEE_PER_FOTOMULTA,
      totalFee: FEE_PER_FOTOMULTA * selected.size,
      userData,
    })
    router.push('/pago')
  }

  const selectedFotomultas = lookup.fotomultas.filter((f) => selected.has(f.comparendoNumber))
  const selectedFineTotal = selectedFotomultas.reduce((sum, f) => sum + f.amount, 0)
  const totalFee = FEE_PER_FOTOMULTA * selected.size
  const savings = selectedFineTotal - totalFee / 100
  const savingsPercent = selectedFineTotal > 0 ? Math.round((savings / selectedFineTotal) * 100) : 0

  const defenseCounts: Record<string, number> = {}
  for (const f of selectedFotomultas) {
    for (const d of f.applicableDefenses) {
      defenseCounts[d] = (defenseCounts[d] ?? 0) + 1
    }
  }
  const sortedDefenseKeys = Object.keys(defenseCounts).sort(
    (a, b) => (STRENGTH_ORDER[DEFENSE_INFO[a]?.strength ?? 'baja'] ?? 2) - (STRENGTH_ORDER[DEFENSE_INFO[b]?.strength ?? 'baja'] ?? 2),
  )

  return (
    <div className="mx-auto max-w-4xl px-4 pb-28 pt-4">
      {/* Step progress */}
      <StepProgress current="resultados" />

      {/* Vehicle header */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <svg className="h-6 w-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0H6.375c-.621 0-1.125-.504-1.125-1.125V14.25m0 0h10.5M3.375 14.25h-.375a3 3 0 0 1-3-3V6.75a3 3 0 0 1 3-3h1.586a1.5 1.5 0 0 1 1.06.44l.312.311A3 3 0 0 0 8.07 5.25H21a2.25 2.25 0 0 1 2.25 2.25v3.75a3 3 0 0 1-3 3h-.375" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{lookup.ownerName}</p>
              <p className="text-xs text-gray-500">
                {lookup.vehicleType} {lookup.vehicleBrand} &mdash; <span className="font-mono font-bold">{lookup.plate}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-extrabold text-red-600">{formatCOP(lookup.totalAmount)}</p>
            <p className="text-xs text-gray-400">{lookup.fotomultas.length} fotomulta{lookup.fotomultas.length > 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Savings card */}
      {selected.size > 0 && (
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 via-white to-accent-50 p-6 shadow-sm ring-1 ring-brand-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500 text-white">
                  <svg className="h-4 w-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-gray-900">Ahorro potencial</h3>
              </div>
              <p className="mt-2 text-3xl font-extrabold text-accent-600">{formatCOP(savings)}</p>
              <p className="text-xs text-gray-500">{savingsPercent}% del total de multas seleccionadas</p>
            </div>
            <div className="text-right text-xs text-gray-500">
              <p>Multas: <span className="font-medium text-red-600">{formatCOP(selectedFineTotal)}</span></p>
              <p>Servicio: <span className="font-medium text-gray-700">{formatCOP(totalFee / 100)}</span></p>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-white/80 p-3 text-xs leading-relaxed text-gray-600">
            <span className="font-medium text-gray-700">Si no impugna:</span> Debera pagar el total de las multas. En cobro coactivo se agregan intereses y costas que pueden duplicar el monto.
          </div>
        </div>
      )}

      {/* Defense analysis */}
      {sortedDefenseKeys.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-bold text-gray-700">Defensas legales identificadas</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {sortedDefenseKeys.map((key) => (
              <DefenseCard key={key} defenseKey={key} count={defenseCounts[key] ?? 0} total={selectedFotomultas.length} />
            ))}
          </div>
        </div>
      )}

      {/* Trust signals */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-gray-200">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <svg className="h-4 w-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" />
            </svg>
          </div>
          <span className="text-xs text-gray-600">Respaldado por jurisprudencia vigente</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-gray-200">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <svg className="h-4 w-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <span className="text-xs text-gray-600">Documento personalizado para su caso</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-gray-200">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <svg className="h-4 w-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </div>
          <span className="text-xs text-gray-600">Envio directo a la Secretaria de Movilidad</span>
        </div>
      </div>

      {/* Fotomulta selection */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700">Seleccione las fotomultas a impugnar</h2>
          <button
            onClick={() => {
              if (selected.size === lookup.fotomultas.length) setSelected(new Set())
              else setSelected(new Set(lookup.fotomultas.map((f) => f.comparendoNumber)))
            }}
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            {selected.size === lookup.fotomultas.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
          </button>
        </div>
        <div className="space-y-3">
          {lookup.fotomultas.map((f, i) => (
            <FotomultaCard
              key={f.comparendoNumber}
              fotomulta={f}
              index={i}
              isSelected={selected.has(f.comparendoNumber)}
              onToggle={() => toggleSelect(f.comparendoNumber)}
            />
          ))}
        </div>
      </div>

      {/* User data form */}
      {showForm && (
        <form
          id="user-form"
          onSubmit={handleSubmitForm}
          className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
        >
          <h2 className="mb-1 text-lg font-bold text-gray-900">Datos del peticionario</h2>
          <p className="mb-5 text-xs text-gray-500">
            Estos datos se usaran unicamente en el documento legal. No se comparten con terceros.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Nombre completo', key: 'name' as const, type: 'text', span: false, autoComplete: 'name' },
              { label: 'Cedula', key: 'cedula' as const, type: 'text', span: false, autoComplete: 'off' },
              { label: 'Ciudad expedicion cedula', key: 'cedulaCity' as const, type: 'text', span: false, autoComplete: 'off' },
              { label: 'Correo electronico', key: 'email' as const, type: 'email', span: false, autoComplete: 'email' },
              { label: 'Telefono', key: 'phone' as const, type: 'text', span: false, autoComplete: 'tel' },
              { label: 'Ciudad', key: 'city' as const, type: 'text', span: false, autoComplete: 'address-level2' },
              { label: 'Direccion', key: 'address' as const, type: 'text', span: true, autoComplete: 'street-address' },
            ].map((field) => (
              <div key={field.key} className={field.span ? 'sm:col-span-2' : ''}>
                <label htmlFor={`field-${field.key}`} className="mb-1.5 block text-xs font-medium text-gray-700">{field.label} *</label>
                <input
                  id={`field-${field.key}`}
                  required
                  type={field.type}
                  autoComplete={field.autoComplete}
                  value={userData[field.key]}
                  onChange={(e) => {
                    const val = field.key === 'cedula' ? e.target.value.replace(/\D/g, '') : e.target.value
                    setUserData((p) => ({ ...p, [field.key]: val }))
                  }}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            ))}
          </div>
          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-xl"
          >
            Continuar al pago &mdash; {formatCOP(totalFee / 100)}
          </button>
          <p className="mt-2 text-center text-xs text-gray-400">
            Al continuar acepta que generemos y enviemos el documento en su nombre.
          </p>
        </form>
      )}

      {/* Sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-md" role="status" aria-live="polite">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-900">
              {selected.size} fotomulta{selected.size !== 1 ? 's' : ''} seleccionada{selected.size !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-500">
              Servicio: {formatCOP(totalFee / 100)}
              {selected.size > 0 && (
                <span className="ml-2 font-medium text-accent-600">Ahorro: {formatCOP(savings)}</span>
              )}
            </p>
          </div>
          {!showForm ? (
            <button
              onClick={handleProceed}
              disabled={selected.size === 0}
              className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition-all hover:-translate-y-0.5 hover:bg-brand-700 disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0"
            >
              Impugnar seleccionadas
            </button>
          ) : (
            <p className="text-xs text-gray-400">Complete el formulario</p>
          )}
        </div>
      </div>
    </div>
  )
}
