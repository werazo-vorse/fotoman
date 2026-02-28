'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { CheckoutSession } from '../components/session-store'
import { getCheckout } from '../components/session-store'

type FlowState = 'summary' | 'paying' | 'processing' | 'success' | 'error'

interface ProcessResult {
  caseId: string
  submissionProof: { messageId: string; sentTo: string; sentAt: string }
  pdfDownloadUrl: string
  deadlineDate: string
}

function downloadPdf(dataUrl: string) {
  const base64 = dataUrl.replace(/^data:application\/pdf;base64,/, '')
  const bytes = atob(base64)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) {
    arr[i] = bytes.charCodeAt(i)
  }
  const blob = new Blob([arr], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `derecho-de-peticion-${Date.now()}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

function formatCOP(amountCents: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amountCents / 100)
}

export default function PagoPage() {
  const router = useRouter()
  const [checkout, setCheckout] = useState<CheckoutSession | null>(null)
  const [state, setState] = useState<FlowState>('summary')
  const [result, setResult] = useState<ProcessResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const data = getCheckout()
    if (!data) {
      router.replace('/consulta')
      return
    }
    setCheckout(data)
  }, [router])

  if (!checkout) return null

  async function handlePay() {
    if (!checkout) return
    setState('paying')

    try {
      const payRes = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountInCents: checkout.totalFee,
          description: `Impugnacion ${checkout.selectedComparendos.length} fotomulta(s) - ${checkout.lookup.plate}`,
          customerEmail: checkout.userData.email,
        }),
      })
      const payData = await payRes.json()

      if (!payRes.ok || !payData.reference) {
        setError(payData.error ?? 'Error creando el pago')
        setState('error')
        return
      }

      setState('processing')

      const processRes = await fetch('/api/process-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentReference: payData.reference,
          selectedComparendos: checkout.selectedComparendos,
          userData: checkout.userData,
          lookupData: checkout.lookup,
        }),
      })
      const processData = await processRes.json()

      if (!processRes.ok || !processData.success) {
        setError(processData.error ?? 'Error procesando el caso')
        setState('error')
        return
      }

      setResult(processData)
      setState('success')
    } catch {
      setError('Error de conexion. Intente de nuevo.')
      setState('error')
    }
  }

  const selectedFotomultas = checkout.lookup.fotomultas.filter((f) =>
    checkout.selectedComparendos.includes(f.comparendoNumber),
  )

  if (state === 'processing') {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Procesando su caso</h1>
          <p className="mb-6 text-sm text-gray-500">
            Estamos generando su derecho de peticion personalizado y preparando el envio a la Secretaria de Movilidad. Esto puede tardar hasta un minuto.
          </p>
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3 rounded-xl bg-green-50 p-3 text-sm text-green-700 ring-1 ring-green-200">
              <span>✓</span>
              <span>Pago confirmado</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-700 ring-1 ring-blue-200">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <span>Generando documento legal...</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-400 ring-1 ring-gray-200">
              <span>○</span>
              <span>Envio a la autoridad de transito</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'success' && result) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
            ✓
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Caso en proceso</h1>
          <p className="mb-6 text-sm text-gray-500">
            Su derecho de peticion fue generado y enviado a la Secretaria de Movilidad. Puede consultar el estado de su caso en cualquier momento desde su panel.
          </p>

          <div className="mb-6 space-y-3 rounded-xl bg-gray-50 p-4 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">ID de seguimiento</span>
              <span className="font-mono text-xs text-gray-700">{result.submissionProof.messageId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Enviado a</span>
              <span className="text-gray-700">{result.submissionProof.sentTo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Fecha limite de respuesta</span>
              <span className="font-medium text-gray-900">{result.deadlineDate}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href={`/panel/${result.caseId}`}
              className="block rounded-xl bg-blue-600 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Ver estado de mi caso
            </Link>
            <button
              onClick={() => downloadPdf(result.pdfDownloadUrl)}
              className="block w-full rounded-xl bg-gray-100 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              Descargar documento PDF
            </button>
          </div>

          <p className="mt-6 text-xs text-gray-400">
            La autoridad tiene 15 dias habiles para responder. Le notificaremos el resultado.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">Resumen de pago</h1>

      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-3 text-sm font-bold text-gray-700">Fotomultas a impugnar</h2>
        <div className="space-y-2">
          {selectedFotomultas.map((f) => (
            <div key={f.comparendoNumber} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {f.infractionCode} &mdash; {f.infractionDescription}
              </span>
              <span className="font-medium text-gray-900">{formatCOP(f.amount * 100)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Servicio Fotoman ({checkout.selectedComparendos.length} fotomulta{checkout.selectedComparendos.length > 1 ? 's' : ''})
            </span>
            <span className="text-lg font-bold text-blue-600">{formatCOP(checkout.totalFee)}</span>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl bg-blue-50 p-4 text-sm text-blue-700 ring-1 ring-blue-200">
        <p className="font-medium">Al pagar se ejecutara automaticamente:</p>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-xs">
          <li>Generacion del derecho de peticion personalizado</li>
          <li>Envio por correo a la Secretaria de Movilidad</li>
          <li>Copia a su correo: {checkout.userData.email}</li>
        </ol>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-4 text-center text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={state === 'paying'}
        className="w-full rounded-xl bg-blue-600 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {state === 'paying' && 'Procesando pago...'}
        {(state === 'summary' || state === 'error') && `Pagar ${formatCOP(checkout.totalFee)}`}
      </button>
    </div>
  )
}
