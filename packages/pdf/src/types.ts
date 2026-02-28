export interface PetitionerInfo {
  fullName: string
  cedula: string
  cedulaCity: string
  email: string
  address: string
  phone: string
}

export interface VehicleInfo {
  plate: string
  type: string
  brand: string
}

export interface FotomultaRef {
  resolutionNumber: string
  comparendoNumber: string
  infractionDate: string
  infractionCode: string
}

export interface FundamentoDeDerecho {
  title: string
  text: string
}

export interface PetitionInput {
  city: string
  date: string
  authority: string
  petitioner: PetitionerInfo
  vehicle: VehicleInfo
  fotomultas: FotomultaRef[]
  defenseKeys?: string[]
  hechos: string[]
  peticiones: string[]
  fundamentosDeDerecho: FundamentoDeDerecho[]
  refutacion: string
  pruebas: string[]
}

export interface TutelaInput {
  city: string
  date: string
  petitioner: PetitionerInfo
  authority: string
  authorityAddress: string
  authorityNotificationEmail: string
  originalPetitionDate: string
  originalPetitionSubject: string
  businessDaysElapsed: number
  peticiones: string[]
  pruebas: string[]
}
