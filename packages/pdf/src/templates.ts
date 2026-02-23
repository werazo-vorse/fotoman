import { getLegalReference } from '@fotoman/core/legal-kb'
import type { FotomultaRef, FundamentoDeDerecho } from './types.js'

export function buildDefaultPeticiones(fotomultas: FotomultaRef[]): string[] {
  const resNums = fotomultas.map((f) => `No. ${f.resolutionNumber}`).join(' y ')

  return [
    `NULIDAD Y ARCHIVO: Solicito se declare la nulidad de las Resoluciones ${resNums} y, en consecuencia, se proceda al archivo definitivo de los comparendos que les dieron origen, por flagrante violación al debido proceso y falta de notificación en debida forma.`,
    `ACTUALIZACIÓN DE BASES DE DATOS: Una vez declarada la nulidad, solicito que se proceda a eliminar el reporte de estas sanciones de las plataformas SIMIT y RUNT, dejando mi historial de tránsito a paz y salvo por estos conceptos.`,
    `ENTREGA DE PRUEBAS DE NOTIFICACIÓN: Solicito que se me entregue y/o remita a mi correo electrónico, sin cobro alguno, copia y/o constancia de: guía de envío, trazabilidad del envío, actas de fijación de edicto (si aplica) y constancia de primera y segunda entrega de las notificaciones correspondientes a las Órdenes de Comparendo, las Resoluciones Sancionatorias, y el Mandamiento de Pago (si existiere cobro coactivo).`,
    `EXPEDICIÓN DE ACTO MOTIVADO: Solicito que la respuesta a la presente petición sea emitida mediante un acto administrativo debidamente motivado, resolviendo de fondo cada uno de los puntos aquí expuestos.`,
  ]
}

export function buildFundamentos(defenseKeys: string[]): FundamentoDeDerecho[] {
  const fundamentos: FundamentoDeDerecho[] = []

  const debidoProceso = getLegalReference('constitucion-art29')
  if (debidoProceso) {
    fundamentos.push({
      title: 'DEBIDO PROCESO (Artículo 29 Constitución Política)',
      text: `${debidoProceso.fullText} En este caso, la omisión de la notificación personal o por correo del acto administrativo sancionatorio constituye una vía de hecho que invalida lo actuado.`,
    })
  }

  if (defenseKeys.includes('indebida-notificacion')) {
    const ref = getLegalReference('ley-1843-2017-art8')
    if (ref) {
      fundamentos.push({
        title: 'NOTIFICACIÓN DE FOTOMULTAS (Ley 1843 de 2017, Artículo 8)',
        text: ref.fullText,
      })
    }

    const t051 = getLegalReference('sentencia-t051-2016')
    if (t051) {
      fundamentos.push({
        title: 'RESPONSABILIDAD DE LA NOTIFICACIÓN (Sentencia T-051 de 2016)',
        text: t051.fullText,
      })
    }
  }

  if (defenseKeys.includes('conductor-no-identificado')) {
    const ref = getLegalReference('sentencia-c038-2020')
    if (ref) {
      fundamentos.push({
        title: 'IDENTIFICACIÓN DEL INFRACTOR (Sentencia C-038 de 2020)',
        text: ref.fullText,
      })
    }
  }

  if (defenseKeys.includes('caducidad')) {
    const ref = getLegalReference('cnt-art161')
    if (ref) {
      fundamentos.push({
        title: 'CADUCIDAD (Artículo 161, Código Nacional de Tránsito)',
        text: ref.fullText,
      })
    }
  }

  if (defenseKeys.includes('prescripcion')) {
    const ref = getLegalReference('cnt-art159')
    if (ref) {
      fundamentos.push({
        title: 'PRESCRIPCIÓN (Artículo 159, Ley 769 de 2002)',
        text: ref.fullText,
      })
    }
  }

  if (defenseKeys.includes('vicios-tecnicos')) {
    const ref = getLegalReference('resolucion-718-2018')
    if (ref) {
      fundamentos.push({
        title: 'REQUISITOS TÉCNICOS (Resolución 718 de 2018)',
        text: ref.fullText,
      })
    }
  }

  return fundamentos
}

export function buildDefaultRefutacion(): string {
  return (
    'Anticipo, además, alguna respuesta habitual por parte de la administración, que no se ajusta al ' +
    'marco normativo vigente y que desde ya refuto: "La Secretaría tiene un año para notificar." No ' +
    'es correcto. El "año" al que suelen aludir corresponde a figuras distintas (por ejemplo, la ' +
    'caducidad de la potestad sancionatoria) que no reemplazan ni modifican el término especial ' +
    'previsto en el artículo 8 de la Ley 1843 de 2017, el cual exige que la orden de comparendo sea ' +
    'enviada dentro de los 13 días hábiles siguientes a la presunta infracción, a la dirección registrada ' +
    'en el RUNT. El envío extemporáneo, o la falta de prueba del envío oportuno, invalida el inicio ' +
    'del procedimiento sancionatorio y obliga al archivo del trámite, sin que esta irregularidad pueda ' +
    'ser subsanada con figuras como la caducidad o la prescripción.'
  )
}

export function buildDefaultPruebas(fotomultas: FotomultaRef[]): string[] {
  const resNums = fotomultas.map((f) => `No. ${f.resolutionNumber}`).join(' y ')
  return [
    `Pantallazos del sistema SIMIT donde constan las Resoluciones ${resNums}.`,
  ]
}
