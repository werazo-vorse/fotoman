import type { Fotomulta, FotomultaStatus, SimitResult } from './types.js'

const VERIFIK_URL = 'https://api.verifik.co/v2/co/simit/comparendos'

interface VerifikComparendo {
  codigoInfraccion: string
  descripcionInfraccion: string
  estadoComparendo: string
  fechaComparendo: string
  fotodeteccion: boolean
  idOrganismoTransito: string
  numeroComparendo: string
  total: string | number
  placavehiculo?: string
  tipovehiculo?: string
  serviciovehiculo?: string
  secretariaComparendo?: string
  direccionComparendo?: string
  infractorComparendo?: string
}

interface VerifikResponse {
  data: { comparendos: VerifikComparendo[] }
  signature: { dateTime: string; message: string }
}

export async function lookupVerifik(
  cedula: string,
  token: string,
): Promise<SimitResult | null> {
  const url = `${VERIFIK_URL}?documentType=CC&documentNumber=${encodeURIComponent(cedula)}`

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error(`Verifik API error: ${response.status}`)
  }

  const body = (await response.json()) as VerifikResponse

  if (!body.data?.comparendos?.length) return null

  const fotomultas: Fotomulta[] = body.data.comparendos.map((c) => ({
    comparendoNumber: c.numeroComparendo,
    resolutionNumber: null,
    infractionDate: c.fechaComparendo.replace(/\//g, '-'),
    notificationDate: null,
    resolutionDate: null,
    cobroCoactivoDate: null,
    infractionCode: c.codigoInfraccion,
    infractionDescription: c.descripcionInfraccion,
    amount: typeof c.total === 'string' ? parseInt(c.total, 10) : c.total,
    status: mapStatus(c.estadoComparendo),
    cameraLocation: c.secretariaComparendo ?? c.direccionComparendo ?? '',
    plate: c.placavehiculo ?? '',
  }))

  const ownerName = body.data.comparendos[0]?.infractorComparendo ?? ''

  return {
    plate: body.data.comparendos[0]?.placavehiculo ?? '',
    ownerName,
    vehicleType: body.data.comparendos[0]?.tipovehiculo ?? '',
    vehicleBrand: '',
    fotomultas,
  }
}

function mapStatus(raw: string): FotomultaStatus {
  const lower = raw.toLowerCase()
  if (lower.includes('pago') || lower.includes('paid')) return 'paid'
  if (lower.includes('cobro') || lower.includes('coactivo')) return 'cobro_coactivo'
  if (lower.includes('pendiente')) return 'pending'
  return 'resolution'
}
