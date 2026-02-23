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
  hechos: string[]
  peticiones: string[]
  fundamentosDeDerecho: FundamentoDeDerecho[]
  refutacion: string
  pruebas: string[]
}
