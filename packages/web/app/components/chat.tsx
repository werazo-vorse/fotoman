'use client'

import { useChat } from '@ai-sdk/react'
import { useRef, useEffect, useState } from 'react'

const TOOL_LABELS: Record<string, string> = {
  lookup_fotomultas: 'Consultando SIMIT',
  calculate_business_days: 'Calculando dias habiles',
  add_business_days: 'Calculando fecha',
  is_business_day: 'Verificando dia habil',
  get_legal_reference: 'Consultando referencia legal',
  get_defense_strategy: 'Analizando estrategia de defensa',
  list_all_defenses: 'Listando defensas disponibles',
  validate_citation: 'Validando citacion legal',
  generate_document: 'Generando documento legal',
  create_payment: 'Generando enlace de pago',
  submit_petition: 'Enviando peticion por correo',
}

function downloadPdf(base64: string, filename: string) {
  const bytes = atob(base64)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) {
    arr[i] = bytes.charCodeAt(i)
  }
  const blob = new Blob([arr], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function ToolPart({ part }: { part: { type: string; state: string; toolName?: string; input?: Record<string, unknown>; output?: Record<string, unknown>; toolCallId: string } }) {
  const toolName = part.type.replace('tool-', '')
  const label = TOOL_LABELS[toolName] ?? toolName

  if (part.state === 'input-streaming' || part.state === 'input-available') {
    return (
      <div className="my-2 flex items-center gap-2 rounded-lg bg-gray-50 p-2 text-xs text-gray-500 ring-1 ring-gray-200">
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <span>{label}...</span>
      </div>
    )
  }

  if (part.state === 'output-error') {
    const errorText = (part as unknown as { errorText?: string }).errorText
    return (
      <div className="my-2 rounded-lg bg-red-50 p-2 text-xs text-red-600 ring-1 ring-red-200">
        {label}: {errorText ?? 'Error'}
      </div>
    )
  }

  if (part.state === 'output-available' && toolName === 'generate_document') {
    const output = part.output as { base64Pdf?: string; sizeBytes?: number; message?: string }
    return (
      <div className="my-2 rounded-lg bg-green-50 p-3 ring-1 ring-green-200">
        <div className="mb-2 flex items-center gap-2 text-xs text-green-700">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-medium">Documento generado</span>
          {output?.sizeBytes && (
            <span className="text-green-500">({Math.round(output.sizeBytes / 1024)} KB)</span>
          )}
        </div>
        {output?.base64Pdf && (
          <button
            onClick={() => downloadPdf(output.base64Pdf!, `derecho-de-peticion-${Date.now()}.pdf`)}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            Descargar PDF
          </button>
        )}
      </div>
    )
  }

  if (part.state === 'output-available' && toolName === 'create_payment') {
    const output = part.output as { paymentUrl?: string | null; amount?: string; error?: string }
    if (output?.paymentUrl) {
      return (
        <div className="my-2 rounded-lg bg-yellow-50 p-3 ring-1 ring-yellow-200">
          <div className="mb-2 flex items-center gap-2 text-xs text-yellow-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">Pago requerido: {output.amount}</span>
          </div>
          <a
            href={output.paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-600"
          >
            Pagar ahora
          </a>
        </div>
      )
    }
    return (
      <div className="my-2 rounded-lg bg-red-50 p-2 text-xs text-red-600 ring-1 ring-red-200">
        Error al crear pago: {output?.error ?? 'Error desconocido'}
      </div>
    )
  }

  if (part.state === 'output-available' && toolName === 'submit_petition') {
    const output = part.output as { submitted?: boolean; messageId?: string; message?: string }
    return (
      <div className={`my-2 rounded-lg p-3 ring-1 ${output?.submitted ? 'bg-green-50 ring-green-200' : 'bg-red-50 ring-red-200'}`}>
        <div className={`flex items-center gap-2 text-xs ${output?.submitted ? 'text-green-700' : 'text-red-700'}`}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">
            {output?.submitted ? 'Peticion enviada' : 'Error al enviar'}
          </span>
        </div>
        {output?.messageId && (
          <p className="mt-1 text-xs text-gray-500">ID: {output.messageId}</p>
        )}
      </div>
    )
  }

  if (part.state === 'output-available' && toolName === 'lookup_fotomultas') {
    const output = part.output as { found?: boolean; fotomultaCount?: number }
    return (
      <div className="my-2 rounded-lg bg-blue-50 p-2 text-xs text-blue-700 ring-1 ring-blue-200">
        <span className="font-medium">{label}</span>
        {output?.found && <span className="ml-2">{output.fotomultaCount} fotomulta(s) encontrada(s)</span>}
        {!output?.found && <span className="ml-2">No se encontraron fotomultas</span>}
      </div>
    )
  }

  return (
    <div className="my-2 rounded-lg bg-gray-50 p-2 text-xs text-gray-500 ring-1 ring-gray-200">
      <span className="font-medium">{label}</span>
      <span className="ml-2 text-green-600">completado</span>
    </div>
  )
}

export function Chat() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status, error } = useChat()
  const scrollRef = useRef<HTMLDivElement>(null)
  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Fotoman</h1>
        <p className="text-sm text-gray-500">
          Asistente legal para impugnar fotomultas en Cali
        </p>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-md text-center">
              <h2 className="mb-2 text-lg font-semibold text-gray-700">
                Bienvenido a Fotoman
              </h2>
              <p className="mb-4 text-sm text-gray-500">
                Soy su asistente legal especializado en fotomultas. Ingrese su
                numero de placa para consultar sus fotomultas y analizar
                posibles defensas.
              </p>
              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                Ejemplo: &quot;Mi placa es BYF83F&quot;
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 shadow-sm ring-1 ring-gray-200'
                }`}
              >
                {message.parts.map((part, i) => {
                  if (part.type === 'text') {
                    return (
                      <div key={`${message.id}-${i}`} className="whitespace-pre-wrap">
                        {part.text}
                      </div>
                    )
                  }
                  if (part.type.startsWith('tool-')) {
                    return (
                      <ToolPart
                        key={`${message.id}-${i}`}
                        part={part as unknown as Parameters<typeof ToolPart>[0]['part']}
                      />
                    )
                  }
                  return null
                })}
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-white px-4 py-3 text-sm text-gray-400 shadow-sm ring-1 ring-gray-200">
                Analizando...
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-6 mb-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Error: {error.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 bg-white px-6 py-4"
      >
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escriba su numero de placa o pregunta..."
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  )
}
