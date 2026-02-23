export type ReferenceType = 'ley' | 'sentencia' | 'articulo' | 'resolucion' | 'codigo'

export interface LegalReference {
  key: string
  type: ReferenceType
  citation: string
  shortName: string
  summary: string
  fullText: string
}

export type DefenseKey =
  | 'indebida-notificacion'
  | 'conductor-no-identificado'
  | 'caducidad'
  | 'prescripcion'
  | 'vicios-tecnicos'

export interface DefenseStrategy {
  key: DefenseKey
  name: string
  description: string
  requiredRefs: string[]
  applicableWhen: string
}
