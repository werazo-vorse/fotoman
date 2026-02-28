import { getLegalReference } from '@fotoman/core/legal-kb'
import type { FotomultaRef, FundamentoDeDerecho, TutelaInput } from './types.js'

function formatComparendoList(fotomultas: FotomultaRef[]): string {
  return fotomultas
    .map((f) => `No. ${f.comparendoNumber} de fecha ${f.infractionDate}, con resolución No. ${f.resolutionNumber}`)
    .join('; ')
}

export function buildDefaultPeticiones(fotomultas: FotomultaRef[], defenseKeys: string[] = []): string[] {
  if (defenseKeys.includes('prescripcion')) {
    return buildPrescripcionPeticiones(fotomultas)
  }
  if (defenseKeys.includes('caducidad')) {
    return buildCaducidadPeticiones(fotomultas)
  }
  return buildNotificacionPeticiones(fotomultas)
}

function buildNotificacionPeticiones(fotomultas: FotomultaRef[]): string[] {
  const resNums = fotomultas.map((f) => `No. ${f.resolutionNumber}`).join(' y ')

  return [
    `NULIDAD Y ARCHIVO: Solicito se declare la nulidad de las Resoluciones ${resNums} y, en consecuencia, se proceda al archivo definitivo de los comparendos que les dieron origen, por flagrante violación al debido proceso y falta de notificación en debida forma.`,
    `ACTUALIZACIÓN DE BASES DE DATOS: Una vez declarada la nulidad, solicito que se proceda a eliminar el reporte de estas sanciones de las plataformas SIMIT y RUNT, dejando mi historial de tránsito a paz y salvo por estos conceptos.`,
    `ENTREGA DE PRUEBAS DE NOTIFICACIÓN: Solicito que se me entregue y/o remita a mi correo electrónico, sin cobro alguno, copia y/o constancia de: guía de envío, trazabilidad del envío, actas de fijación de edicto (si aplica) y constancia de primera y segunda entrega de las notificaciones correspondientes a las Órdenes de Comparendo, las Resoluciones Sancionatorias, y el Mandamiento de Pago (si existiere cobro coactivo).`,
    `COPIA DE FIRMA DE TESTIGO: Solicito copia de la firma del testigo del informe de comparendo de las multas mencionadas, conforme al artículo 135 del Código Nacional de Tránsito, el cual exige que si el conductor se niega a firmar, firmará por él un testigo, y contra dicho informe solamente procede la tacha de falsedad.`,
    `NOTIFICACIÓN ELECTRÓNICA: Solicito que todos los documentos requeridos me sean enviados por correo electrónico, conforme a lo aprobado por la Ley 962 de 2005 (Ley Anti-trámites).`,
    `EXPEDICIÓN DE ACTO MOTIVADO: Solicito que la respuesta a la presente petición sea emitida mediante un acto administrativo debidamente motivado, resolviendo de fondo cada uno de los puntos aquí expuestos.`,
  ]
}

function buildPrescripcionPeticiones(fotomultas: FotomultaRef[]): string[] {
  const comparendoList = formatComparendoList(fotomultas)

  return [
    `PRESCRIPCIÓN: Solicito la aplicación de la prescripción de las multas y comparendos que a continuación se detallan, los cuales se encuentran registrados a mi nombre en el sistema SIMIT: ${comparendoList}. Lo anterior en virtud del inciso segundo del artículo 159 del Código Nacional de Tránsito (Ley 769 de 2002), que establece que las sanciones impuestas por infracciones a las normas de tránsito prescribirán en tres (3) años contados a partir de la ocurrencia del hecho, y que la autoridad de tránsito no podrá iniciar el cobro coactivo de sanciones respecto de las cuales se encuentren configurados los supuestos necesarios para declarar su prescripción.`,
    `PRUEBA DE COBRO COACTIVO: De determinarse que la administración ha realizado de manera adecuada el cobro coactivo de los comparendos mencionados, solicito se me envíe copia del documento que conste el intento de notificación del mandamiento de pago, en cumplimiento del principio de publicidad de los actos administrativos conforme a lo dispuesto en la Sentencia C-957 de 1999 y el artículo 826 del Estatuto Tributario, que establece que el mandamiento de pago debe notificarse personalmente al deudor.`,
    `DEBIDO PROCESO Y NOTIFICACIÓN: Solicito que se apliquen los principios generales del derecho (in dubio pro reo, legalidad, presunción de inocencia), en razón de que nunca fui debidamente notificado de la comisión de las supuestas infracciones que se me atribuyen. De no haberse cumplido con la debida notificación, se configurarían además los requisitos de la caducidad de que habla el artículo 161 del Código Nacional de Tránsito.`,
    `COPIA DE FIRMA DE TESTIGO: Solicito copia de la firma del testigo del informe de comparendo de las multas mencionadas, conforme al artículo 135 del Código Nacional de Tránsito, el cual exige que la orden de comparendo deberá estar firmada por el conductor o, en su defecto, por un testigo.`,
    `MOTIVACIÓN EN CASO DE RECHAZO: En caso de no aplicar los criterios de prescripción y notificación dictados por las altas cortes colombianas, solicito se me explique las razones de fondo de dicho actuar.`,
    `COPIA DE RESOLUCIONES DE COBRO: Solicito copia de las resoluciones en donde se establece la facultad para iniciar el mandamiento de pago, de acuerdo con lo estipulado en el artículo 74 de la Constitución Política de Colombia que consagra el derecho de toda persona a acceder a los documentos públicos.`,
    `NOTIFICACIÓN ELECTRÓNICA: Solicito que todos los documentos requeridos me sean enviados por correo electrónico, conforme a lo aprobado por la Ley 962 de 2005 (Ley Anti-trámites).`,
    `EXONERACIÓN Y ELIMINACIÓN: Solicito se me garantice la protección de mis derechos fundamentales al debido proceso, al derecho de petición y a la igualdad. En consecuencia, solicito la exoneración del pago de las multas y comparendos registrados a mi nombre y la eliminación del correspondiente registro en el SIMIT.`,
  ]
}

function buildCaducidadPeticiones(fotomultas: FotomultaRef[]): string[] {
  const comparendoList = formatComparendoList(fotomultas)

  return [
    `CADUCIDAD Y ARCHIVO: Solicito se declare la caducidad de la acción sancionatoria respecto de las siguientes multas y comparendos registrados a mi nombre en el sistema SIMIT: ${comparendoList}. Lo anterior en virtud del artículo 161 del Código Nacional de Tránsito y del artículo 52 de la Ley 1437 de 2011 (CPACA), que establece que la facultad sancionatoria caduca a los tres (3) años de ocurrido el hecho, término dentro del cual el acto administrativo que impone la sanción debe haber sido expedido y notificado.`,
    `PRUEBA DE NOTIFICACIÓN OPORTUNA: Solicito que se me envíe copia y/o constancia de la notificación de la resolución sancionatoria dentro del término legal, incluyendo guía de envío, trazabilidad del envío, y actas de fijación de edicto si aplica. De no existir prueba de notificación oportuna, la resolución no produce efectos jurídicos conforme a la Sentencia C-957 de 1999.`,
    `DEBIDO PROCESO: Solicito que se apliquen los principios de legalidad y presunción de inocencia, dado que al no haber sido notificado oportunamente, se me privó de la oportunidad de ejercer mi derecho de defensa y contradicción.`,
    `COPIA DE FIRMA DE TESTIGO: Solicito copia de la firma del testigo del informe de comparendo, conforme al artículo 135 del Código Nacional de Tránsito.`,
    `NOTIFICACIÓN ELECTRÓNICA: Solicito que todos los documentos requeridos me sean enviados por correo electrónico, conforme a lo aprobado por la Ley 962 de 2005 (Ley Anti-trámites).`,
    `EXONERACIÓN Y ELIMINACIÓN: Solicito se me garantice la protección de mis derechos fundamentales al debido proceso y al derecho de petición. En consecuencia, solicito la exoneración del pago y la eliminación del correspondiente registro en el SIMIT.`,
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

    const art52 = getLegalReference('ley-1437-2011-art52')
    if (art52) {
      fundamentos.push({
        title: 'CADUCIDAD DE LA FACULTAD SANCIONATORIA (Artículo 52, Ley 1437 de 2011)',
        text: art52.fullText,
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

    const art52 = getLegalReference('ley-1437-2011-art52')
    if (art52) {
      fundamentos.push({
        title: 'CADUCIDAD DE LA FACULTAD SANCIONATORIA (Artículo 52, Ley 1437 de 2011)',
        text: art52.fullText,
      })
    }

    const art826 = getLegalReference('estatuto-tributario-art826')
    if (art826) {
      fundamentos.push({
        title: 'MANDAMIENTO DE PAGO (Artículo 826, Estatuto Tributario)',
        text: art826.fullText,
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

  const art23 = getLegalReference('constitucion-art23')
  if (art23) {
    fundamentos.push({
      title: 'DERECHO DE PETICIÓN (Artículo 23, Constitución Política)',
      text: `${art23.fullText} La Ley 1755 de 2015 reglamenta este derecho fundamental y establece que toda petición deberá resolverse dentro de los quince (15) días hábiles siguientes a su recepción, so pena de sanción disciplinaria.`,
    })
  }

  return fundamentos
}

export function buildDefaultRefutacion(defenseKeys: string[] = [], knownCounterArgs: string[] = []): string {
  if (knownCounterArgs.length > 0) {
    const rebuttals = knownCounterArgs
      .map((arg, i) => `${i + 1}) "${arg}" -- Este argumento no se ajusta al marco normativo vigente.`)
      .join(' ')
    return (
      'Anticipo los siguientes argumentos que la administración ha utilizado en casos previos y que desde ya refuto: ' +
      rebuttals +
      ' A continuación detallo las razones legales por las cuales dichos argumentos carecen de sustento:'
    )
  }

  if (defenseKeys.includes('prescripcion')) {
    return (
      'Anticipo posibles respuestas habituales de la administración: ' +
      '1) "Se encuentra en cobro coactivo." Si no se notificó personalmente el mandamiento de pago conforme al artículo 826 del Estatuto Tributario, ' +
      'ni se agotó el procedimiento de citación previa, dicho cobro coactivo adolece de vicios que impiden interrumpir la prescripción. ' +
      'La mera expedición del mandamiento sin notificación no constituye interrupción válida del término prescriptivo. ' +
      '2) "El término se cuenta desde que la resolución queda en firme." El artículo 159 de la Ley 769 de 2002 establece claramente ' +
      'que las sanciones prescriben en tres (3) años contados a partir de la ocurrencia del hecho. La prescripción debe ser declarada ' +
      'de oficio, y la autoridad no puede iniciar cobro coactivo respecto de sanciones ya prescritas. ' +
      '3) "Se realizó notificación por aviso o edicto." La notificación por aviso solo procede cuando se han agotado los medios de ' +
      'notificación personal y por correo certificado, conforme al CPACA. De no acreditarse este agotamiento, la notificación es inválida.'
    )
  }

  if (defenseKeys.includes('caducidad')) {
    return (
      'Anticipo posibles respuestas habituales de la administración: ' +
      '1) "La resolución fue expedida dentro del término." No basta con la expedición: el artículo 52 de la Ley 1437 de 2011 exige ' +
      'que el acto administrativo haya sido expedido Y notificado dentro del término de caducidad. Sin prueba de notificación oportuna, ' +
      'la sanción carece de efectos jurídicos. ' +
      '2) "La Secretaría tiene un año para notificar." El término de un año del artículo 161 del Código Nacional de Tránsito ' +
      'es perentorio e improrrogable. Transcurrido sin que se haya proferido y notificado la resolución sancionatoria, ' +
      'se procederá al archivo del expediente, sin que esta irregularidad pueda subsanarse.'
    )
  }

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
    'Copia de mi cédula de ciudadanía.',
    `Pantallazos del sistema SIMIT donde constan las Resoluciones ${resNums} y el estado de cuenta.`,
  ]
}

export function buildTutelaHechos(input: TutelaInput): string[] {
  return [
    `El día ${input.originalPetitionDate} fue radicado un derecho de petición dirigido a la ${input.authority}, a través del correo electrónico ${input.authorityNotificationEmail}. En cumplimiento de lo establecido en la ley, el término legal para dar respuesta comenzó a contarse a partir del primer día hábil siguiente a su radicación.`,
    `En dicho derecho de petición se solicitaba: ${input.originalPetitionSubject}.`,
    `Consultando el estado del proceso, se evidencia que ha transcurrido un periodo de ${input.businessDaysElapsed} días hábiles, superior a los 15 días hábiles establecidos por la Ley 1755 de 2015 para dar respuesta a los derechos de petición. Esta situación constituye un incumplimiento de los plazos legales que rigen el trámite de estas solicitudes.`,
    `Por lo tanto, al no haber respondido en el tiempo establecido sobre lo solicitado en el derecho de petición, procedo a interponer acción de tutela contra la ${input.authority}, en virtud del artículo 23 de la Constitución Política de Colombia, el cual consagra el derecho fundamental de petición y establece la obligación de las entidades de responder de forma clara, completa y oportuna.`,
  ]
}

export function buildTutelaPeticiones(): string[] {
  return [
    'Se TUTELEN mis derechos fundamentales al Debido Proceso y de Petición, vulnerados por la entidad accionada.',
    'Se ORDENE a la entidad accionada dar respuesta de fondo, clara, completa y congruente al derecho de petición radicado, dentro de las cuarenta y ocho (48) horas siguientes a la notificación del fallo de tutela.',
    'Se ORDENE a la entidad accionada resolver de fondo cada una de las peticiones contenidas en el derecho de petición original.',
  ]
}

export function buildTutelaFundamentos(): FundamentoDeDerecho[] {
  const fundamentos: FundamentoDeDerecho[] = []

  fundamentos.push({
    title: 'DERECHO DE PETICIÓN (Artículo 23, Constitución Política)',
    text: 'Toda persona tiene derecho a presentar peticiones respetuosas a las autoridades por motivos de interés general o particular y a obtener pronta resolución. El núcleo esencial del derecho de petición reside en la resolución pronta y oportuna de la cuestión.',
  })

  fundamentos.push({
    title: 'ACCIÓN DE TUTELA (Artículo 86, Constitución Política)',
    text: 'Toda persona tendrá acción de tutela para reclamar ante los jueces, en todo momento y lugar, mediante un procedimiento preferente y sumario, la protección inmediata de sus derechos constitucionales fundamentales, cuando quiera que éstos resulten vulnerados o amenazados por la acción o la omisión de cualquier autoridad pública.',
  })

  fundamentos.push({
    title: 'PLAZO DE RESPUESTA (Artículo 14, Ley 1755 de 2015)',
    text: 'Salvo norma legal especial y so pena de sanción disciplinaria, toda petición deberá resolverse dentro de los quince (15) días siguientes a su recepción. Las peticiones de documentos y de información deberán resolverse dentro de los diez (10) días siguientes.',
  })

  fundamentos.push({
    title: 'JURISPRUDENCIA CONSTITUCIONAL',
    text: 'La Corte Constitucional ha indicado de manera reiterada que la respuesta al derecho de petición debe cumplir con tres requisitos: 1) oportunidad, 2) debe resolverse de fondo, clara, precisa y de manera congruente con lo solicitado, y 3) ser puesta en conocimiento del peticionario. Si no se cumple con estos requisitos se incurre en una vulneración del derecho constitucional fundamental de petición (Sentencia T-332 de 2015). El silencio administrativo no libera a la administración de la obligación de resolver oportunamente la petición.',
  })

  return fundamentos
}

export function buildTutelaPruebas(): string[] {
  return [
    'Copia de mi cédula de ciudadanía.',
    'Copia del derecho de petición radicado.',
    'Constancia de radicación del derecho de petición (correo electrónico con confirmación de envío).',
    'Pantallazos del sistema SIMIT donde consta el estado de cuenta.',
  ]
}
