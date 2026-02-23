export type FotomultaStatus = 'pending' | 'resolution' | 'cobro_coactivo' | 'paid'

export interface Fotomulta {
  comparendoNumber: string
  resolutionNumber: string | null
  infractionDate: string
  notificationDate: string | null
  resolutionDate: string | null
  infractionCode: string
  infractionDescription: string
  amount: number
  status: FotomultaStatus
  cameraLocation: string
  plate: string
}

export interface SimitResult {
  plate: string
  ownerName: string
  vehicleType: string
  vehicleBrand: string
  fotomultas: Fotomulta[]
}
