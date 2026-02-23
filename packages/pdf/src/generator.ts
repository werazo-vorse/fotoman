import type { PetitionInput } from './types.js'
import {
  createLayoutContext,
  finalize,
  writeBlankLine,
  writeLine,
  writeNumberedItem,
  writeSectionHeader,
} from './layout.js'

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
  writeSignature(ctx, input)

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
  writeLine(ctx, `REFERENCIA: IMPUGNACIÓN RESOLUCIÓN ${resolutions}`, { bold: true })
  writeBlankLine(ctx)
}

function writePetitionerIntro(
  ctx: Parameters<typeof writeLine>[0],
  input: PetitionInput,
): void {
  const { petitioner } = input
  const text =
    `${petitioner.fullName}, mayor de edad, identificada con la cédula de ciudadanía ` +
    `No. ${petitioner.cedula} expedida en ${petitioner.cedulaCity}, en ejercicio del derecho fundamental de petición ` +
    `consagrado en el artículo 23 de la Constitución Política de Colombia y en cumplimiento de las ` +
    `disposiciones legales contenidas en la Ley 1755 de 2015, por medio del presente escrito ` +
    `interpongo formal solicitud de revocatoria directa y/o nulidad de las resoluciones sancionatorias ` +
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
  input: PetitionInput,
): void {
  writeBlankLine(ctx)
  writeLine(ctx, 'Atentamente,')
  writeBlankLine(ctx)
  writeBlankLine(ctx)
  writeLine(ctx, `${input.petitioner.fullName} C.C. No. ${input.petitioner.cedula} de ${input.petitioner.cedulaCity}`, {
    bold: true,
  })
}
