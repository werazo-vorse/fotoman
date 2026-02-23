import type { DefenseStrategy } from './types.js'

export const DEFENSE_STRATEGIES: DefenseStrategy[] = [
  {
    key: 'indebida-notificacion',
    name: 'Indebida Notificación',
    description:
      'La autoridad no envió la orden de comparendo dentro de los 13 días hábiles siguientes a la infracción, o no puede probar que la notificación fue efectivamente entregada.',
    requiredRefs: [
      'ley-1843-2017-art8',
      'sentencia-t051-2016',
      'constitucion-art29',
      'cpaca-notificacion',
    ],
    applicableWhen:
      'business_days(infraction_date, notification_date) > 13 OR no proof of delivery exists',
  },
  {
    key: 'conductor-no-identificado',
    name: 'Conductor No Identificado (C-038/2020)',
    description:
      'La cámara de fotodetección captura la placa del vehículo, no al conductor. El propietario no es automáticamente responsable. El Estado debe identificar plenamente al conductor.',
    requiredRefs: ['sentencia-c038-2020', 'sentencia-c321-2022', 'constitucion-art29'],
    applicableWhen:
      'Infraction detected by camera (fotomulta). Owner claims they were not driving.',
  },
  {
    key: 'caducidad',
    name: 'Caducidad de la Acción Sancionatoria',
    description:
      'Ha transcurrido más de un año desde la comisión de la infracción sin que se haya proferido y notificado la resolución sancionatoria.',
    requiredRefs: ['cnt-art161', 'constitucion-art29'],
    applicableWhen: 'elapsed_years(infraction_date, today) >= 1 AND no resolution notified',
  },
  {
    key: 'prescripcion',
    name: 'Prescripción de la Sanción',
    description:
      'Han transcurrido más de tres años desde que la resolución sancionatoria quedó en firme sin que se haya iniciado cobro coactivo.',
    requiredRefs: ['cnt-art159'],
    applicableWhen:
      'elapsed_years(resolution_firm_date, today) >= 3 AND no cobro coactivo initiated',
  },
  {
    key: 'vicios-tecnicos',
    name: 'Vicios Técnicos del Sistema de Fotodetección',
    description:
      'El sistema de fotodetección no cumple con los requisitos técnicos exigidos: falta de señalización visible a 500m, ausencia de autorización del MinTransporte, o certificado de calibración vencido o inexistente.',
    requiredRefs: ['resolucion-718-2018', 'constitucion-art29'],
    applicableWhen:
      'Camera lacks visible signage at 500m, OR no MinTransporte authorization, OR no valid calibration certificate',
  },
]
