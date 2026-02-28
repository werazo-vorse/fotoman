import type { PetitionInput, TutelaInput } from './types.js'
import {
  createLayoutContext,
  finalize,
  writeBlankLine,
  writeLine,
  writeNumberedItem,
  writeSectionHeader,
} from './layout.js'
import {
  buildTutelaHechos,
  buildTutelaPeticiones,
  buildTutelaFundamentos,
  buildTutelaPruebas,
} from './templates.js'

export async function generatePetitionPdf(input: PetitionInput): Promise<Uint8Array> {
  const ctx = await createLayoutContext()

  writeHeader(ctx, input)
  writePetitionerIntro(ctx, input)
  writeHechos(ctx, input)
  writePeticiones(ctx, input)
  writeFundamentosDeDerecho(ctx, input)
  writeRefutacion(ctx, input)
  writePruebas(ctx, input)
  writeNotificaciones(ctx, input)
  writeSignature(ctx, input.petitioner)

  return finalize(ctx)
}

function writeHeader(
  ctx: Parameters<typeof writeLine>[0],
  input: PetitionInput,
): void {
  writeLine(ctx, `${input.city}, ${input.date}`)
  writeBlankLine(ctx)
  writeLine(ctx, `Señores: ${input.authority}`)
  writeLine(ctx, 'E. S. D.')
  writeBlankLine(ctx)

  const resolutions = input.fotomultas
    .map((f) => `No. ${f.resolutionNumber}`)
    .join(' Y RESOLUCIÓN ')

  const defenses = input.defenseKeys ?? []
  const isPrescripcion = defenses.includes('prescripcion')
  const isCaducidad = defenses.includes('caducidad')

  let refType: string
  if (isPrescripcion) {
    refType = 'DERECHO DE PETICIÓN - PRESCRIPCIÓN'
  } else if (isCaducidad) {
    refType = 'DERECHO DE PETICIÓN - CADUCIDAD'
  } else {
    refType = 'REVOCATORIA DIRECTA Y/O NULIDAD'
  }

  writeLine(ctx, `REFERENCIA: ${refType} RESOLUCIÓN ${resolutions}`, { bold: true })
  writeBlankLine(ctx)
}

function writePetitionerIntro(
  ctx: Parameters<typeof writeLine>[0],
  input: PetitionInput,
): void {
  const { petitioner } = input
  const defenses = input.defenseKeys ?? []
  const isPrescripcion = defenses.includes('prescripcion')
  const isCaducidad = defenses.includes('caducidad')

  let solicitudType: string
  if (isPrescripcion) {
    solicitudType = 'solicitud de declaración de prescripción de las sanciones'
  } else if (isCaducidad) {
    solicitudType = 'solicitud de declaración de caducidad y archivo de los expedientes'
  } else {
    solicitudType = 'solicitud de revocatoria directa y/o nulidad de las resoluciones sancionatorias'
  }

  const text =
    `${petitioner.fullName}, mayor de edad, identificado(a) con la cédula de ciudadanía ` +
    `No. ${petitioner.cedula} expedida en ${petitioner.cedulaCity}, en ejercicio del derecho fundamental de petición ` +
    `consagrado en el artículo 23 de la Constitución Política de Colombia y en cumplimiento de las ` +
    `disposiciones legales contenidas en la Ley 1755 de 2015, por medio del presente escrito ` +
    `interpongo formal ${solicitudType} ` +
    `anteriormente mencionadas, con base en los siguientes:`
  writeLine(ctx, text)
  writeBlankLine(ctx)
}

function writeHechos(
  ctx: Parameters<typeof writeLine>[0],
  input: PetitionInput,
): void {
  writeSectionHeader(ctx, 'HECHOS')
  for (let i = 0; i < input.hechos.length; i++) {
    writeNumberedItem(ctx, i + 1, input.hechos[i]!)
  }
}

function writePeticiones(
  ctx: Parameters<typeof writeLine>[0],
  input: PetitionInput,
): void {
  writeSectionHeader(ctx, 'PETICIONES')
  for (let i = 0; i < input.peticiones.length; i++) {
    writeNumberedItem(ctx, i + 1, input.peticiones[i]!)
  }
}

function writeFundamentosDeDerecho(
  ctx: Parameters<typeof writeLine>[0],
  input: PetitionInput,
): void {
  writeSectionHeader(ctx, 'FUNDAMENTOS DE DERECHO')
  for (let i = 0; i < input.fundamentosDeDerecho.length; i++) {
    const f = input.fundamentosDeDerecho[i]!
    writeNumberedItem(ctx, i + 1, `${f.title}: ${f.text}`)
  }
}

function writeRefutacion(
  ctx: Parameters<typeof writeLine>[0],
  input: PetitionInput,
): void {
  writeSectionHeader(ctx, 'REFUTACIÓN A ARGUMENTOS ADMINISTRATIVOS HABITUALES')
  writeLine(ctx, input.refutacion)
}

function writePruebas(
  ctx: Parameters<typeof writeLine>[0],
  input: PetitionInput,
): void {
  writeSectionHeader(ctx, 'PRUEBAS')
  writeLine(ctx, 'Para sustentar mi petición, solicito se tengan como tales:')
  writeBlankLine(ctx)
  for (let i = 0; i < input.pruebas.length; i++) {
    writeNumberedItem(ctx, i + 1, input.pruebas[i]!)
  }
}

function writeNotificaciones(
  ctx: Parameters<typeof writeLine>[0],
  input: PetitionInput,
): void {
  writeSectionHeader(ctx, 'NOTIFICACIONES')
  writeLine(
    ctx,
    `Recibiré notificaciones preferiblemente en el correo electrónico: ${input.petitioner.email}`,
  )
  writeLine(
    ctx,
    `Dirección física: ${input.petitioner.address}, ${input.city}. Teléfono: ${input.petitioner.phone}`,
  )
}

function writeSignature(
  ctx: Parameters<typeof writeLine>[0],
  petitioner: PetitionInput['petitioner'],
): void {
  writeBlankLine(ctx)
  writeLine(ctx, 'Atentamente,')
  writeBlankLine(ctx)
  writeBlankLine(ctx)
  writeLine(ctx, `${petitioner.fullName} C.C. No. ${petitioner.cedula} de ${petitioner.cedulaCity}`, {
    bold: true,
  })
}

export async function generateTutelaPdf(input: TutelaInput): Promise<Uint8Array> {
  const ctx = await createLayoutContext()

  writeLine(ctx, `${input.city}, ${input.date}`)
  writeBlankLine(ctx)
  writeLine(ctx, 'Señor')
  writeLine(ctx, 'JUEZ CIVIL MUNICIPAL (REPARTO)', { bold: true })
  writeLine(ctx, 'E. S. D.')
  writeBlankLine(ctx)

  writeLine(ctx, `ACCIONANTE: ${input.petitioner.fullName}, identificado con cédula de ciudadanía número ${input.petitioner.cedula} de ${input.petitioner.cedulaCity}.`, { bold: true })
  writeLine(ctx, `ACCIONADO: ${input.authority}.`, { bold: true })
  writeBlankLine(ctx)
  writeLine(ctx, 'REF: Acción De Tutela Para Proteger El Derecho Fundamental De Petición.', { bold: true })
  writeBlankLine(ctx)

  const introText =
    `${input.petitioner.fullName}, identificado con cédula de ciudadanía número ${input.petitioner.cedula} de ${input.petitioner.cedulaCity}, ` +
    `residente en ${input.city}, correo electrónico: ${input.petitioner.email}, actuando en nombre propio, ` +
    `invocando el artículo 86 de la Constitución Política, acudo ante su Despacho para instaurar ` +
    `ACCIÓN DE TUTELA contra ${input.authority}, con el objeto de que se protejan los derechos constitucionales fundamentales que a continuación enuncio:`
  writeLine(ctx, introText)
  writeBlankLine(ctx)

  const hechos = buildTutelaHechos(input)
  writeSectionHeader(ctx, 'HECHOS')
  for (let i = 0; i < hechos.length; i++) {
    writeNumberedItem(ctx, i + 1, hechos[i]!)
  }

  writeSectionHeader(ctx, 'DERECHOS VULNERADOS')
  writeLine(ctx, 'Derecho fundamental de petición consagrado en el artículo 23 de la Constitución Política de Colombia de 1991.')
  writeBlankLine(ctx)

  const fundamentos = buildTutelaFundamentos()
  writeSectionHeader(ctx, 'FUNDAMENTOS DE LA ACCIÓN')
  for (let i = 0; i < fundamentos.length; i++) {
    const f = fundamentos[i]!
    writeNumberedItem(ctx, i + 1, `${f.title}: ${f.text}`)
  }

  const peticiones = input.peticiones.length > 0 ? input.peticiones : buildTutelaPeticiones()
  writeSectionHeader(ctx, 'PETICIONES')
  for (let i = 0; i < peticiones.length; i++) {
    writeNumberedItem(ctx, i + 1, peticiones[i]!)
  }

  const pruebas = input.pruebas.length > 0 ? input.pruebas : buildTutelaPruebas()
  writeSectionHeader(ctx, 'PRUEBAS')
  for (let i = 0; i < pruebas.length; i++) {
    writeNumberedItem(ctx, i + 1, pruebas[i]!)
  }

  writeSectionHeader(ctx, 'JURAMENTO')
  writeLine(ctx, 'Bajo la gravedad de juramento, declaro que los hechos aquí expuestos son ciertos y constituyen una afectación directa e inminente a mis derechos fundamentales.')
  writeBlankLine(ctx)

  writeSectionHeader(ctx, 'NOTIFICACIONES')
  writeLine(ctx, `ACCIONANTE: Se recibirán notificaciones al correo electrónico ${input.petitioner.email}.`)
  writeLine(ctx, `ACCIONADA: ${input.authorityAddress}, correo electrónico de notificaciones judiciales: ${input.authorityNotificationEmail}.`)
  writeBlankLine(ctx)

  writeSignature(ctx, input.petitioner)

  return finalize(ctx)
}
