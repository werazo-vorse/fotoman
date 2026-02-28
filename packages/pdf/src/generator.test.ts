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

const DEFAULT_DEFENSES = ['indebida-notificacion', 'conductor-no-identificado']

function buildSampleInput(defenseKeys: string[] = DEFAULT_DEFENSES): PetitionInput {
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
    peticiones: buildDefaultPeticiones(SAMPLE_FOTOMULTAS, defenseKeys),
    fundamentosDeDerecho: buildFundamentos(defenseKeys),
    refutacion: buildDefaultRefutacion(defenseKeys),
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
    input.peticiones = buildDefaultPeticiones([SAMPLE_FOTOMULTAS[0]!], DEFAULT_DEFENSES)
    input.pruebas = buildDefaultPruebas([SAMPLE_FOTOMULTAS[0]!])
    const pdf = await generatePetitionPdf(input)
    expect(pdf.length).toBeGreaterThan(0)
  })

  it('generates valid PDF for prescripcion defense', async () => {
    const input = buildSampleInput(['prescripcion'])
    const pdf = await generatePetitionPdf(input)
    const doc = await PDFDocument.load(pdf)
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(2)
  })

  it('generates valid PDF for caducidad defense', async () => {
    const input = buildSampleInput(['caducidad'])
    const pdf = await generatePetitionPdf(input)
    const doc = await PDFDocument.load(pdf)
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1)
  })
})

describe('templates', () => {
  it('buildDefaultPeticiones returns 6 items for notificacion defense', () => {
    const peticiones = buildDefaultPeticiones(SAMPLE_FOTOMULTAS, ['indebida-notificacion'])
    expect(peticiones).toHaveLength(6)
    expect(peticiones[0]).toContain('NULIDAD')
  })

  it('buildDefaultPeticiones returns 8 items for prescripcion defense', () => {
    const peticiones = buildDefaultPeticiones(SAMPLE_FOTOMULTAS, ['prescripcion'])
    expect(peticiones).toHaveLength(8)
    expect(peticiones[0]).toContain('prescripción')
  })

  it('buildDefaultPeticiones returns 6 items for caducidad defense', () => {
    const peticiones = buildDefaultPeticiones(SAMPLE_FOTOMULTAS, ['caducidad'])
    expect(peticiones).toHaveLength(6)
    expect(peticiones[0]).toContain('caducidad')
  })

  it('buildDefaultPeticiones for prescripcion includes comparendo numbers and dates', () => {
    const peticiones = buildDefaultPeticiones(SAMPLE_FOTOMULTAS, ['prescripcion'])
    expect(peticiones[0]).toContain('76001000000045904867')
    expect(peticiones[0]).toContain('15/01/2025')
  })

  it('buildDefaultPeticiones includes resolution numbers for notificacion', () => {
    const peticiones = buildDefaultPeticiones(SAMPLE_FOTOMULTAS, ['indebida-notificacion'])
    expect(peticiones[0]).toContain('0001887446')
    expect(peticiones[0]).toContain('0001936615')
  })

  it('buildDefaultPeticiones for prescripcion includes fallback cobro coactivo request', () => {
    const peticiones = buildDefaultPeticiones(SAMPLE_FOTOMULTAS, ['prescripcion'])
    expect(peticiones[1]).toContain('cobro coactivo')
    expect(peticiones[1]).toContain('mandamiento de pago')
  })

  it('buildDefaultPeticiones always includes electronic delivery request', () => {
    for (const defense of ['indebida-notificacion', 'prescripcion', 'caducidad']) {
      const peticiones = buildDefaultPeticiones(SAMPLE_FOTOMULTAS, [defense])
      expect(peticiones.some((p) => p.includes('correo electrónico') && p.includes('Ley 962'))).toBe(true)
    }
  })

  it('buildDefaultPeticiones always includes testigo signature request', () => {
    for (const defense of ['indebida-notificacion', 'prescripcion', 'caducidad']) {
      const peticiones = buildDefaultPeticiones(SAMPLE_FOTOMULTAS, [defense])
      expect(peticiones.some((p) => p.includes('testigo') && p.includes('artículo 135'))).toBe(true)
    }
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

  it('buildFundamentos includes caducidad article and CPACA art 52', () => {
    const fundamentos = buildFundamentos(['caducidad'])
    const titles = fundamentos.map((f) => f.title)
    expect(titles.some((t) => t.includes('161'))).toBe(true)
    expect(titles.some((t) => t.includes('Ley 1437'))).toBe(true)
  })

  it('buildFundamentos includes prescripcion article plus art 52 and art 826', () => {
    const fundamentos = buildFundamentos(['prescripcion'])
    const titles = fundamentos.map((f) => f.title)
    expect(titles.some((t) => t.includes('159'))).toBe(true)
    expect(titles.some((t) => t.includes('Ley 1437'))).toBe(true)
    expect(titles.some((t) => t.includes('826'))).toBe(true)
  })

  it('buildFundamentos always includes derecho de peticion', () => {
    for (const defense of ['indebida-notificacion', 'prescripcion', 'caducidad']) {
      const fundamentos = buildFundamentos([defense])
      const titles = fundamentos.map((f) => f.title)
      expect(titles.some((t) => t.includes('DERECHO DE PETICIÓN'))).toBe(true)
    }
  })

  it('buildDefaultRefutacion returns defense-specific text', () => {
    expect(buildDefaultRefutacion(['prescripcion'])).toContain('cobro coactivo')
    expect(buildDefaultRefutacion(['caducidad'])).toContain('artículo 52')
    expect(buildDefaultRefutacion(['indebida-notificacion'])).toContain('Ley 1843')
  })

  it('buildDefaultPruebas includes cedula and SIMIT screenshots', () => {
    const pruebas = buildDefaultPruebas(SAMPLE_FOTOMULTAS)
    expect(pruebas).toHaveLength(2)
    expect(pruebas[0]).toContain('cédula')
    expect(pruebas[1]).toContain('0001887446')
  })
})
