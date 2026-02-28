import Link from 'next/link'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ANALYZING: { label: 'Analizando', color: 'bg-yellow-100 text-yellow-700' },
  DOCUMENT_READY: { label: 'Documento listo', color: 'bg-blue-100 text-blue-700' },
  PAYMENT_PENDING: { label: 'Pendiente de pago', color: 'bg-orange-100 text-orange-700' },
  PAID: { label: 'Pagado', color: 'bg-green-100 text-green-700' },
  SUBMITTED: { label: 'Enviado', color: 'bg-blue-100 text-blue-700' },
  AWAITING_RESPONSE: { label: 'Esperando respuesta', color: 'bg-purple-100 text-purple-700' },
  RESPONDED: { label: 'Respondido', color: 'bg-indigo-100 text-indigo-700' },
  RESOLVED: { label: 'Resuelto', color: 'bg-green-100 text-green-700' },
  ESCALATED: { label: 'Escalado', color: 'bg-red-100 text-red-700' },
}

interface DashboardCase {
  id: string
  plate: string
  vehicleType: string
  status: string
  fotomultaCount: number
  submissionDate: string | null
  deadlineDate: string | null
  businessDaysRemaining: number | null
  deadlineExpired: boolean
  createdAt: string
}

async function getCases(userEmail: string): Promise<DashboardCase[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/panel/cases?email=${encodeURIComponent(userEmail)}`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    return (await res.json()) as DashboardCase[]
  } catch {
    return []
  }
}

export default async function PanelPage() {
  // TODO: Re-enable auth guard once NextAuth + Prisma adapter is configured
  // const session = await auth()
  // if (!session?.user?.email) redirect('/auth/signin')
  // const cases = await getCases(session.user.email)
  const cases: DashboardCase[] = []

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Casos</h1>
        </div>
        <Link
          href="/consulta"
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Nueva consulta
        </Link>
      </div>

      {cases.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">
            📋
          </div>
          <h2 className="mb-2 text-lg font-semibold text-gray-700">No tiene casos activos</h2>
          <p className="mb-4 text-sm text-gray-500">
            Consulte sus fotomultas para iniciar una impugnacion.
          </p>
          <Link
            href="/consulta"
            className="inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Consultar fotomultas
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((c) => {
            const statusInfo = STATUS_LABELS[c.status] ?? { label: c.status, color: 'bg-gray-100 text-gray-700' }
            return (
              <Link
                key={c.id}
                href={`/panel/${c.id}`}
                className="block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {c.vehicleType.toLowerCase().includes('moto') ? '🏍️' : '🚗'}
                      </span>
                      <span className="font-mono text-sm font-bold text-gray-900">{c.plate}</span>
                      <span className="text-xs text-gray-400">
                        {c.fotomultaCount} fotomulta{c.fotomultaCount > 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {c.submissionDate && (
                      <p>Enviado: {new Date(c.submissionDate).toLocaleDateString('es-CO')}</p>
                    )}
                    {c.deadlineDate && !c.deadlineExpired && c.businessDaysRemaining !== null && (
                      <p className="mt-1 font-medium text-purple-600">
                        {c.businessDaysRemaining} dias habiles restantes
                      </p>
                    )}
                    {c.deadlineExpired && (
                      <p className="mt-1 font-bold text-red-600">Plazo vencido</p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
