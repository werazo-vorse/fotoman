'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveLookup } from './session-store'

export function LookupForm() {
  const router = useRouter()
  const [cedula, setCedula] = useState('')
  const [plate, setPlate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cedula.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plate: plate.trim(), cedula: cedula.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error consultando SIMIT')
        return
      }

      if (!data.found) {
        setError(`No se encontraron fotomultas para la placa ${data.plate}`)
        return
      }

      saveLookup({
        plate: data.plate,
        cedula: cedula.trim(),
        ownerName: data.ownerName,
        vehicleType: data.vehicleType,
        vehicleBrand: data.vehicleBrand,
        fotomultas: data.fotomultas,
        totalAmount: data.totalAmount,
      })

      router.push('/resultados')
    } catch {
      setError('Error de conexion. Intente de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Consultar fotomultas</h1>
        <p className="mt-2 text-gray-500">
          Ingrese su cedula para consultar el SIMIT e identificar defensas legales
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mx-auto mb-8 max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
      >
        <div className="mb-4">
          <label htmlFor="cedula" className="mb-1 block text-sm font-medium text-gray-700">
            Cedula *
          </label>
          <input
            id="cedula"
            type="text"
            value={cedula}
            onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
            placeholder="Ej: 1107511514"
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="plate" className="mb-1 block text-sm font-medium text-gray-700">
            Placa del vehiculo (opcional)
          </label>
          <input
            id="plate"
            type="text"
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            placeholder="Ej: ZGY80F"
            maxLength={6}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !cedula.trim()}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Consultando SIMIT...' : 'Consultar fotomultas'}
        </button>
      </form>

      {error && (
        <div className="mx-auto max-w-md rounded-xl bg-red-50 p-4 text-center text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}
