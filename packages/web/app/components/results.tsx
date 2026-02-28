'use client'

const DEFENSE_LABELS: Record<string, { name: string; color: string; description: string }> = {
  'indebida-notificacion': {
    name: 'Indebida Notificacion',
    color: 'bg-red-100 text-red-700',
    description: 'La notificacion excedio los 13 dias habiles (Art. 8, Ley 1843/2017)',
  },
  'conductor-no-identificado': {
    name: 'Conductor No Identificado',
    color: 'bg-orange-100 text-orange-700',
    description: 'La camara solo capto la placa, no al conductor (Sentencia C-038/2020)',
  },
  caducidad: {
    name: 'Caducidad',
    color: 'bg-purple-100 text-purple-700',
    description: 'Paso mas de 1 año sin resolucion notificada (Art. 161, CNT)',
  },
  prescripcion: {
    name: 'Prescripcion',
    color: 'bg-indigo-100 text-indigo-700',
    description: 'Pasaron mas de 3 años sin cobro coactivo (Art. 159, Ley 769/2002)',
  },
  'vicios-tecnicos': {
    name: 'Vicios Tecnicos',
    color: 'bg-yellow-100 text-yellow-700',
    description: 'Falta de señalizacion, autorizacion o calibracion (Res. 718/2018)',
  },
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Sin registro'
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

interface FotomultaResult {
  comparendoNumber: string
  resolutionNumber: string | null
  infractionDate: string
  notificationDate: string | null
  resolutionDate: string | null
  infractionCode: string
  infractionDescription: string
  amount: number
  status: string
  cameraLocation: string
  notificationBusinessDays: number | null
  applicableDefenses: string[]
}

interface ResultsProps {
  plate: string
  ownerName: string
  vehicleType: string
  vehicleBrand: string
  fotomultas: FotomultaResult[]
  totalAmount: number
  cedula: string
}

export function Results({
  plate,
  ownerName,
  vehicleType,
  vehicleBrand,
  fotomultas,
  totalAmount,
  cedula,
}: ResultsProps) {
  const defenseCounts: Record<string, number> = {}
  for (const f of fotomultas) {
    for (const d of f.applicableDefenses) {
      defenseCounts[d] = (defenseCounts[d] ?? 0) + 1
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{ownerName}</h2>
            <p className="text-sm text-gray-500">
              {vehicleType} {vehicleBrand} - Placa{' '}
              <span className="font-mono font-bold">{plate}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-red-600">{formatCOP(totalAmount)}</p>
            <p className="text-xs text-gray-500">
              {fotomultas.length} fotomulta{fotomultas.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Defense summary */}
      <div className="rounded-2xl bg-blue-50 p-6 ring-1 ring-blue-200">
        <h3 className="mb-3 text-sm font-bold text-blue-900">Defensas identificadas</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(defenseCounts).map(([key, count]) => {
            const def = DEFENSE_LABELS[key]
            if (!def) return null
            return (
              <div key={key} className="rounded-xl bg-white p-3 ring-1 ring-blue-100">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${def.color}`}>
                    {def.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {count}/{fotomultas.length} fotomultas
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-600">{def.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Fotomultas list */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-700">Detalle de fotomultas</h3>
        {fotomultas.map((f, i) => (
          <div
            key={f.comparendoNumber}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400">Fotomulta {i + 1}</p>
                <p className="font-mono text-sm font-medium text-gray-900">
                  {f.infractionCode} - {f.infractionDescription}
                </p>
              </div>
              <p className="text-lg font-bold text-gray-900">{formatCOP(f.amount)}</p>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-400">Fecha infraccion</p>
                <p className="font-medium text-gray-700">{formatDate(f.infractionDate)}</p>
              </div>
              <div>
                <p className="text-gray-400">Fecha notificacion</p>
                <p className={`font-medium ${f.notificationDate ? 'text-gray-700' : 'text-red-600'}`}>
                  {formatDate(f.notificationDate)}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Resolucion</p>
                <p className="font-mono font-medium text-gray-700">
                  {f.resolutionNumber ?? 'Sin resolucion'}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Dias habiles notificacion</p>
                <p className={`font-medium ${
                  f.notificationBusinessDays !== null && f.notificationBusinessDays > 13
                    ? 'text-red-600 font-bold'
                    : f.notificationBusinessDays !== null
                      ? 'text-green-600'
                      : 'text-red-600'
                }`}>
                  {f.notificationBusinessDays !== null
                    ? `${f.notificationBusinessDays} dias${f.notificationBusinessDays > 13 ? ' (EXCEDE 13)' : ''}`
                    : 'Sin notificacion'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400">Ubicacion camara</p>
                <p className="font-medium text-gray-700">{f.cameraLocation}</p>
              </div>
            </div>

            {f.applicableDefenses.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {f.applicableDefenses.map((d) => {
                  const def = DEFENSE_LABELS[d]
                  return def ? (
                    <span
                      key={d}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${def.color}`}
                    >
                      {def.name}
                    </span>
                  ) : null
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="rounded-2xl bg-green-50 p-6 text-center ring-1 ring-green-200">
        <p className="mb-2 text-sm font-bold text-green-800">
          Se identificaron defensas para {fotomultas.length} fotomulta{fotomultas.length > 1 ? 's' : ''}
        </p>
        <p className="mb-4 text-xs text-green-700">
          Podemos generar un derecho de peticion para impugnar estas fotomultas ante la Secretaria de Movilidad.
        </p>
        <button
          className="rounded-xl bg-green-600 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700"
          onClick={() => {
            // TODO: wire to document generation flow
            alert('Funcionalidad de generacion de documento en desarrollo')
          }}
        >
          Generar documento de impugnacion
        </button>
      </div>
    </div>
  )
}
