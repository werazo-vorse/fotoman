import type { LegalReference } from './types.js'

export const LEGAL_REFERENCES: LegalReference[] = [
  {
    key: 'constitucion-art23',
    type: 'articulo',
    citation: 'Artículo 23, Constitución Política de Colombia',
    shortName: 'Derecho de petición',
    summary: 'Toda persona tiene derecho a presentar peticiones respetuosas a las autoridades.',
    fullText:
      'Toda persona tiene derecho a presentar peticiones respetuosas a las autoridades por motivos de interés general o particular y a obtener pronta resolución. El legislador podrá reglamentar su ejercicio ante organizaciones privadas para garantizar los derechos fundamentales.',
  },
  {
    key: 'constitucion-art29',
    type: 'articulo',
    citation: 'Artículo 29, Constitución Política de Colombia',
    shortName: 'Debido proceso',
    summary:
      'El debido proceso se aplicará a toda clase de actuaciones judiciales y administrativas.',
    fullText:
      'El debido proceso se aplicará a toda clase de actuaciones judiciales y administrativas. Nadie podrá ser juzgado sino conforme a leyes preexistentes al acto que se le imputa, ante juez o tribunal competente y con observancia de la plenitud de las formas propias de cada juicio. En materia penal, la ley permisiva o favorable, aun cuando sea posterior, se aplicará de preferencia a la restrictiva o desfavorable.',
  },
  {
    key: 'ley-1843-2017-art8',
    type: 'ley',
    citation: 'Artículo 8, Ley 1843 de 2017',
    shortName: 'Notificación 13 días hábiles',
    summary:
      'La orden de comparendo por fotodetección debe enviarse dentro de los 13 días hábiles siguientes a la infracción, a la última dirección registrada en el RUNT.',
    fullText:
      'Esta norma es clara al señalar que el envío de la fotodetección debe realizarse por parte de la autoridad de tránsito dentro de los TRECE (13) DÍAS HÁBILES siguientes a la comisión de la infracción a la última dirección registrada por el ciudadano en el RUNT. El incumplimiento de este término perentorio no es una simple formalidad, sino un requisito de validez para el inicio del proceso sancionatorio.',
  },
  {
    key: 'ley-1755-2015',
    type: 'ley',
    citation: 'Ley 1755 de 2015',
    shortName: 'Derecho de petición (reglamentación)',
    summary:
      'Reglamenta el derecho fundamental de petición. Las autoridades deben responder dentro de 15 días hábiles.',
    fullText:
      'Reglamenta el derecho fundamental de petición consagrado en el artículo 23 de la Constitución Política. Toda persona puede ejercer el derecho de petición para garantizar sus derechos fundamentales. Las autoridades deberán resolver las peticiones dentro de los quince (15) días hábiles siguientes a su recepción.',
  },
  {
    key: 'sentencia-c038-2020',
    type: 'sentencia',
    citation: 'Sentencia C-038 de 2020, Corte Constitucional',
    shortName: 'No responsabilidad solidaria propietario',
    summary:
      'Declaró inexequible la responsabilidad solidaria entre propietario y conductor en fotomultas. El Estado debe identificar al conductor.',
    fullText:
      'La Corte determinó la inexequibilidad de la responsabilidad solidaria entre el propietario del vehículo y el conductor en casos de fotomultas por infracciones dinámicas. La carga de identificar plenamente quién conducía el vehículo al momento de la infracción recae sobre la Secretaría de Movilidad. Al no haber sido identificada plenamente la autoría en la comisión de la falta, se vulnera el principio de culpabilidad.',
  },
  {
    key: 'sentencia-c321-2022',
    type: 'sentencia',
    citation: 'Sentencia C-321 de 2022, Corte Constitucional',
    shortName: 'Sanciones no pueden ser automáticas',
    summary:
      'Refuerza que las sanciones de tránsito no pueden ser automáticas; se requiere debido proceso.',
    fullText:
      'La Corte Constitucional reforzó que las sanciones derivadas de sistemas de fotodetección no pueden imponerse de manera automática. El debido proceso administrativo exige que el presunto infractor tenga oportunidad real de conocer los cargos, presentar descargos y ejercer su derecho de defensa antes de que la sanción quede en firme.',
  },
  {
    key: 'sentencia-t051-2016',
    type: 'sentencia',
    citation: 'Sentencia T-051 de 2016, Corte Constitucional',
    shortName: 'Carga de prueba de notificación',
    summary:
      'El Estado tiene la carga de probar que la notificación fue efectivamente entregada al ciudadano.',
    fullText:
      'La Corte Constitucional ha reiterado que el Estado tiene la carga de la prueba respecto a la notificación. No basta con que la administración "envíe" el documento; debe demostrar que este efectivamente llegó al domicilio del ciudadano o que se agotaron los medios legales para su entrega. La falta de prueba de la recepción de la guía de correo genera la nulidad de las resoluciones posteriores.',
  },
  {
    key: 'cnt-art161',
    type: 'codigo',
    citation: 'Artículo 161, Código Nacional de Tránsito (Ley 769 de 2002)',
    shortName: 'Caducidad 1 año',
    summary:
      'La acción sancionatoria caduca un año después de la comisión de la infracción si no se ha notificado la resolución.',
    fullText:
      'La facultad que tienen las autoridades de tránsito para imponer sanciones por infracciones de tránsito caduca al año, contado a partir de la ocurrencia del hecho. Transcurrido este término sin que se haya proferido y notificado la resolución sancionatoria, se procederá al archivo del expediente.',
  },
  {
    key: 'cnt-art159',
    type: 'codigo',
    citation: 'Artículo 159, Ley 769 de 2002',
    shortName: 'Prescripción 3 años',
    summary:
      'Las sanciones de tránsito prescriben a los tres años de quedar en firme si no se ha iniciado cobro coactivo.',
    fullText:
      'Las sanciones impuestas por infracciones de tránsito prescribirán en tres (3) años, contados a partir de la fecha en que quede en firme el acto administrativo mediante el cual se impuso la sanción. Si dentro de ese término no se ha iniciado el procedimiento de cobro coactivo, la obligación prescribirá.',
  },
  {
    key: 'resolucion-718-2018',
    type: 'resolucion',
    citation: 'Resolución 718 de 2018, Ministerio de Transporte',
    shortName: 'Requisitos técnicos cámaras',
    summary:
      'Establece los requisitos técnicos de los sistemas de fotodetección: señalización visible a 500m, cámaras fijas, certificado de calibración.',
    fullText:
      'Los sistemas de detección electrónica de infracciones de tránsito deberán cumplir con los siguientes requisitos: señalización preventiva visible a mínimo 500 metros, ubicación fija autorizada por el Ministerio de Transporte, certificado de calibración vigente expedido por laboratorio acreditado, y aprobación técnica del equipo. El incumplimiento de cualquiera de estos requisitos invalida las evidencias obtenidas.',
  },
  {
    key: 'cpaca-notificacion',
    type: 'codigo',
    citation: 'Código de Procedimiento Administrativo y de lo Contencioso Administrativo (CPACA)',
    shortName: 'Notificación actos administrativos',
    summary:
      'Regula la forma en que deben notificarse los actos administrativos para que tengan efectos legales.',
    fullText:
      'Los actos administrativos de carácter particular deberán ser notificados personalmente al interesado o a su representante o apoderado. Si no pudiere hacerse la notificación personal, se realizará por medio de correo certificado a la dirección registrada. La falta de notificación en debida forma impide que el acto administrativo produzca efectos legales.',
  },
]
