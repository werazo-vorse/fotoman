import Link from 'next/link'

const STATUS_STEPS = [
  { key: 'ANALYZING', label: 'Analisis' },
  { key: 'PAID', label: 'Pagado' },
  { key: 'SUBMITTED', label: 'Enviado' },
  { key: 'AWAITING_RESPONSE', label: 'Esperando' },
  { key: 'RESOLVED', label: 'Resuelto' },
]

const STATUS_ORDER: Record<string, number> = {
  ANALYZING: 0,
  DOCUMENT_READY: 1,
  PAYMENT_PENDING: 1,
  PAID: 1,
  SUBMITTED: 2,
  AWAITING_RESPONSE: 3,
  RESPONDED: 4,
  RESOLVED: 4,
  ESCALATED: 4,
}

const EVENT_LABELS: Record<string, string> = {
  CREATED: 'Caso creado',
  ANALYSIS_COMPLETE: 'Analisis completado',
  DOCUMENT_GENERATED: 'Documento PDF generado',
  PAYMENT_RECEIVED: 'Pago confirmado',
  SUBMITTED: 'Peticion enviada',
  DEADLINE_WARNING: 'Aviso de plazo proximo a vencer',
  DEADLINE_EXPIRED: 'Plazo de respuesta vencido',
  RESPONSE_RECEIVED: 'Respuesta recibida',
  ESCALATED: 'Caso escalado',
  RESOLVED: 'Caso resuelto',
  NOTE: 'Nota',
}

const DEFENSE_LABELS: Record<string, string> = {
  'indebida-notificacion': 'Indebida Notificacion',
  'conductor-no-identificado': 'Conductor No Identificado',
  caducidad: 'Caducidad',
  prescripcion: 'Prescripcion',
  'vicios-tecnicos': 'Vicios Tecnicos',
}

interface CaseDetail {
  id: string
  plate: string
  vehicleType: string
  status: string
  defensesApplied: string[]
  submissionDate: string | null
  deadlineDate: string | null
  businessDaysElapsed: number | null
  businessDaysRemaining: number | null
  deadlineExpired: boolean
  createdAt: string
  fotomultas: {
    comparendoNumber: string
    infractionCode: string
    infractionDescription: string
    amount: number
    applicableDefenses: string[]
  }[]
  events: {
    type: string
    details: string | null
    createdAt: string
  }[]
  submissionProof: string | null
  authorityEmail: string | null
  hasDocument: boolean
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount)
}

async function getCaseDetail(caseId: string, userEmail: string): Promise<CaseDetail | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    const res = await fetch(
      `${baseUrl}/api/panel/cases/${caseId}?email=${encodeURIComponent(userEmail)}`,
      { cache: 'no-store' },
    )
    if (!res.ok) return null
    return (await res.json()) as CaseDetail
  } catch {
    return null
  }
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>
}) {
  // TODO: Re-enable auth guard once NextAuth + Prisma adapter is configured
  // const session = await auth()
  // if (!session?.user?.email) redirect('/auth/signin')

  const { caseId } = await params
  const caseData = await getCaseDetail(caseId, '')

  if (!caseData) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-gray-900">Caso no encontrado</h1>
        <Link href="/panel" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          Volver a mis casos
        </Link>
      </div>
    )
  }

  const currentStep = STATUS_ORDER[caseData.status] ?? 0

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <Link href="/panel" className="text-sm text-blue-600 hover:underline">
          ← Mis Casos
        </Link>
      </div>

      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h1 className="text-lg font-bold text-gray-900">
          Caso {caseData.plate} &mdash; {caseData.fotomultas.length} fotomulta{caseData.fotomultas.length > 1 ? 's' : ''}
        </h1>
      </div>

      {/* Timeline */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-4 text-sm font-bold text-gray-700">Linea de tiempo</h2>
        <div className="flex items-center justify-between">
          {STATUS_STEPS.map((step, i) => {
            const isCompleted = i <= currentStep
            const isCurrent = i === currentStep
            return (
              <div key={step.key} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      isCompleted
                        ? isCurrent
                          ? 'bg-blue-600 text-white'
                          : 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {isCompleted && !isCurrent ? '✓' : i + 1}
                  </div>
                  <span className={`mt-1 text-xs ${isCurrent ? 'font-bold text-blue-600' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`mx-1 h-0.5 flex-1 ${i < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Deadline countdown */}
      {caseData.deadlineDate && caseData.businessDaysElapsed !== null && (
        <div
          className={`mb-6 rounded-2xl p-6 ring-1 ${
            caseData.deadlineExpired
              ? 'bg-red-50 ring-red-200'
              : 'bg-purple-50 ring-purple-200'
          }`}
        >
          <h2 className={`mb-2 text-sm font-bold ${caseData.deadlineExpired ? 'text-red-800' : 'text-purple-800'}`}>
            Plazo de respuesta
          </h2>
          {caseData.deadlineExpired ? (
            <div>
              <p className="text-sm text-red-700">
                El plazo de 15 dias habiles ha vencido sin respuesta de la autoridad.
              </p>
              <p className="mt-2 text-xs font-medium text-red-600">
                Puede interponer accion de tutela por violacion al derecho de peticion.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-purple-700">
                <span>{caseData.businessDaysElapsed} de 15 dias habiles transcurridos</span>
                <span>{caseData.businessDaysRemaining} restantes</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-purple-200">
                <div
                  className="h-full rounded-full bg-purple-600 transition-all"
                  style={{ width: `${Math.min((caseData.businessDaysElapsed / 15) * 100, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-purple-600">
                Vence: {new Date(caseData.deadlineDate).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Fotomultas */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-3 text-sm font-bold text-gray-700">Fotomultas impugnadas</h2>
        <div className="space-y-3">
          {caseData.fotomultas.map((f) => (
            <div key={f.comparendoNumber} className="flex items-start justify-between rounded-xl bg-gray-50 p-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {f.infractionCode} &mdash; {f.infractionDescription}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {f.applicableDefenses.map((d) => (
                    <span key={d} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                      {DEFENSE_LABELS[d] ?? d}
                    </span>
                  ))}
                </div>
              </div>
              <p className="font-bold text-gray-900">{formatCOP(f.amount)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Document download */}
      {caseData.hasDocument && (
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-3 text-sm font-bold text-gray-700">Documentos</h2>
          <a
            href={`/api/cases/${caseData.id}/pdf`}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            📄 Descargar derecho de peticion (PDF)
          </a>
        </div>
      )}

      {/* Event history */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-3 text-sm font-bold text-gray-700">Historial</h2>
        {caseData.events.length === 0 ? (
          <p className="text-sm text-gray-400">Sin eventos registrados</p>
        ) : (
          <div className="space-y-3">
            {caseData.events.map((ev, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-gray-300" />
                <div className="flex-1">
                  <p className="font-medium text-gray-700">{EVENT_LABELS[ev.type] ?? ev.type}</p>
                  {ev.details && <p className="text-xs text-gray-500">{ev.details}</p>}
                </div>
                <span className="flex-shrink-0 text-xs text-gray-400">
                  {new Date(ev.createdAt).toLocaleString('es-CO', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
