import { describe, expect, it } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { generatePetitionPdf } from './generator.js'
import {
  buildDefaultPeticiones,
  buildDefaultPruebas,
  buildDefaultRefutacion,
  buildFundamentos,
} from './templates.js'
import type { PetitionInput } from './types.js'

const SAMPLE_FOTOMULTAS = [
  {
    resolutionNumber: '0001887446',
    comparendoNumber: '76001000000045904867',
    infractionDate: '15/01/2025',
    infractionCode: 'C14',
  },
  {
    resolutionNumber: '0001936615',
    comparendoNumber: '76001000000048631426',
    infractionDate: '20/02/2025',
    infractionCode: 'C14',
  },
]

function buildSampleInput(): PetitionInput {
  return {
    city: 'Cali',
    date: '09/02/2026',
    authority: 'SECRETARÍA DE MOVILIDAD DE CALI',
    petitioner: {
      fullName: 'DIANA MILEIDY ZUÑIGA ALVEAR',
      cedula: '1143978209',
      cedulaCity: 'Cali',
      email: 'alvear906@gmail.com',
      address: 'Carrera 33# 26b 110',
      phone: '3044666312',
    },
    vehicle: {
      plate: 'BYF83F',
      type: 'Motocicleta',
      brand: 'Moto Triller',
    },
    fotomultas: SAMPLE_FOTOMULTAS,
    hechos: [
      'Que con fecha 13/02/2025 se expidió la Resolución No. 0001887446 derivada de la presunta infracción C14 registrada en el sistema bajo el comparendo No. 76001000000045904867.',
      'Que con fecha 14/03/2025 se expidió la Resolución No. 0001936615 derivada de la presunta infracción C14 registrada en el sistema bajo el comparendo No. 76001000000048631426.',
      'Soy la propietaria de la motocicleta identificada con la placa BYF83F, marca Moto triller.',
      'A la fecha, no he recibido notificación personal ni por correo certificado de los actos administrativos que dieron origen a estas sanciones.',
      'La falta de notificación oportuna me ha impedido ejercer mi derecho a la defensa y contradicción, vulnerando el Debido Proceso administrativo consagrado en el artículo 29 de la Constitución Política.',
    ],
    peticiones: buildDefaultPeticiones(SAMPLE_FOTOMULTAS),
    fundamentosDeDerecho: buildFundamentos(['indebida-notificacion', 'conductor-no-identificado']),
    refutacion: buildDefaultRefutacion(),
    pruebas: buildDefaultPruebas(SAMPLE_FOTOMULTAS),
  }
}

describe('generatePetitionPdf', () => {
  it('generates a valid PDF buffer', async () => {
    const input = buildSampleInput()
    const pdf = await generatePetitionPdf(input)
    expect(pdf).toBeInstanceOf(Uint8Array)
    expect(pdf.length).toBeGreaterThan(0)
  })

  it('generated PDF is parseable', async () => {
    const input = buildSampleInput()
    const pdf = await generatePetitionPdf(input)
    const doc = await PDFDocument.load(pdf)
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1)
  })

  it('PDF has multiple pages for full document', async () => {
    const input = buildSampleInput()
    const pdf = await generatePetitionPdf(input)
    const doc = await PDFDocument.load(pdf)
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(2)
  })

  it('works with a single fotomulta', async () => {
    const input = buildSampleInput()
    input.fotomultas = [SAMPLE_FOTOMULTAS[0]!]
    input.peticiones = buildDefaultPeticiones([SAMPLE_FOTOMULTAS[0]!])
    input.pruebas = buildDefaultPruebas([SAMPLE_FOTOMULTAS[0]!])
    const pdf = await generatePetitionPdf(input)
    expect(pdf.length).toBeGreaterThan(0)
  })
})

describe('templates', () => {
  it('buildDefaultPeticiones returns 4 items', () => {
    const peticiones = buildDefaultPeticiones(SAMPLE_FOTOMULTAS)
    expect(peticiones).toHaveLength(4)
  })

  it('buildDefaultPeticiones includes resolution numbers', () => {
    const peticiones = buildDefaultPeticiones(SAMPLE_FOTOMULTAS)
    expect(peticiones[0]).toContain('0001887446')
    expect(peticiones[0]).toContain('0001936615')
  })

  it('buildFundamentos includes Debido Proceso for any defense', () => {
    const fundamentos = buildFundamentos(['indebida-notificacion'])
    expect(fundamentos[0]!.title).toContain('DEBIDO PROCESO')
  })

  it('buildFundamentos includes notification law for indebida-notificacion', () => {
    const fundamentos = buildFundamentos(['indebida-notificacion'])
    const titles = fundamentos.map((f) => f.title)
    expect(titles.some((t) => t.includes('Ley 1843'))).toBe(true)
    expect(titles.some((t) => t.includes('T-051'))).toBe(true)
  })

  it('buildFundamentos includes C-038 for conductor-no-identificado', () => {
    const fundamentos = buildFundamentos(['conductor-no-identificado'])
    const titles = fundamentos.map((f) => f.title)
    expect(titles.some((t) => t.includes('C-038'))).toBe(true)
  })

  it('buildFundamentos includes caducidad article', () => {
    const fundamentos = buildFundamentos(['caducidad'])
    const titles = fundamentos.map((f) => f.title)
    expect(titles.some((t) => t.includes('CADUCIDAD'))).toBe(true)
  })

  it('buildDefaultRefutacion returns non-empty string', () => {
    expect(buildDefaultRefutacion().length).toBeGreaterThan(100)
  })

  it('buildDefaultPruebas references resolution numbers', () => {
    const pruebas = buildDefaultPruebas(SAMPLE_FOTOMULTAS)
    expect(pruebas[0]).toContain('0001887446')
  })
})
