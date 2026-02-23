'use client'

import { useChat } from '@ai-sdk/react'
import { useRef, useEffect, useState } from 'react'

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
          Asistente legal AI para impugnar fotomultas en Cali
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
                  switch (part.type) {
                    case 'text':
                      return (
                        <div key={`${message.id}-${i}`} className="whitespace-pre-wrap">
                          {part.text}
                        </div>
                      )
                    default:
                      if (part.type.startsWith('tool-')) {
                        return (
                          <div
                            key={`${message.id}-${i}`}
                            className="my-2 rounded-lg bg-gray-50 p-2 text-xs text-gray-500 ring-1 ring-gray-200"
                          >
                            <span className="font-medium">
                              {part.type.replace('tool-', '')}
                            </span>
                            <span className="ml-2 text-green-600">completado</span>
                          </div>
                        )
                      }
                      return null
                  }
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
