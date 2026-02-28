const LOOKUP_KEY = 'fotoman:lookup'
const CHECKOUT_KEY = 'fotoman:checkout'

export interface FotomultaWithAnalysis {
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

export interface LookupSession {
  plate: string
  cedula: string
  ownerName: string
  vehicleType: string
  vehicleBrand: string
  fotomultas: FotomultaWithAnalysis[]
  totalAmount: number
}

export interface UserData {
  name: string
  cedula: string
  cedulaCity: string
  email: string
  phone: string
  address: string
  city: string
}

export interface CheckoutSession {
  lookup: LookupSession
  selectedComparendos: string[]
  feePerFotomulta: number
  totalFee: number
  userData: UserData
}

export function saveLookup(data: LookupSession) {
  sessionStorage.setItem(LOOKUP_KEY, JSON.stringify(data))
}

export function getLookup(): LookupSession | null {
  const raw = sessionStorage.getItem(LOOKUP_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as LookupSession
  } catch {
    return null
  }
}

export function saveCheckout(data: CheckoutSession) {
  sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify(data))
}

export function getCheckout(): CheckoutSession | null {
  const raw = sessionStorage.getItem(CHECKOUT_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as CheckoutSession
  } catch {
    return null
  }
}
