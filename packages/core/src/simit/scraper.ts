import type { Fotomulta, FotomultaStatus, SimitResult } from './types.js'

const SIMIT_URL = 'https://www.fcm.org.co/simit/#/estado-cuenta-498'
const SCRAPE_TIMEOUT = 60_000

export async function scrapeSimit(plate: string): Promise<SimitResult | null> {
  const { chromium } = await import('playwright')
  const browser = await chromium.launch({ headless: true })

  try {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    })
    const page = await context.newPage()

    const capturedResponses: { url: string; body: string }[] = []
    page.on('response', async (response) => {
      const url = response.url()
      if (url.includes('estado-cuenta') && response.status() === 200) {
        try {
          capturedResponses.push({ url, body: await response.text() })
        } catch {
          // response body not available
        }
      }
    })

    await page.goto(SIMIT_URL, { waitUntil: 'load', timeout: SCRAPE_TIMEOUT })
    await page.waitForTimeout(5000)

    // Select "Por placa" if the radio exists
    const placaOption = page.locator('text=Por Placa, text=PLACA, label:has-text("Placa")').first()
    if (await placaOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      await placaOption.click()
    }

    // Fill plate input
    const input = page.locator('input[type="text"]').first()
    await input.waitFor({ state: 'visible', timeout: 10000 })
    await input.fill(plate.toUpperCase())

    // Wait for captcha to finish (button gets "done" class)
    await page.waitForFunction(
      () => {
        const btn = document.querySelector('form#wehatecaptchas button')
        return btn?.classList.contains('done')
      },
      { timeout: SCRAPE_TIMEOUT },
    )

    // Click the submit/consultar button
    const submitBtn = page.locator('button:has-text("Consultar"), form#wehatecaptchas button.done').first()
    await submitBtn.click()

    // Wait for API response
    await page.waitForTimeout(8000)

    // Parse captured API responses
    for (const resp of capturedResponses) {
      try {
        const data = JSON.parse(resp.body)
        const result = parseEstadoCuenta(data, plate)
        if (result) return result
      } catch {
        // not valid JSON or unexpected shape
      }
    }

    // Fallback: scrape rendered HTML
    return await scrapeRenderedTable(page, plate)
  } finally {
    await browser.close()
  }
}

function parseEstadoCuenta(data: Record<string, unknown>, plate: string): SimitResult | null {
  if (!data || typeof data !== 'object') return null

  const items: Fotomulta[] = []

  // The SIMIT API can return data in multiple shapes
  const sources = [
    (data as Record<string, unknown[]>).comparendos,
    (data as Record<string, unknown[]>).multas,
    (data as { data?: { comparendos?: unknown[]; multas?: unknown[] } }).data?.comparendos,
    (data as { data?: { comparendos?: unknown[]; multas?: unknown[] } }).data?.multas,
  ]

  for (const source of sources) {
    if (!Array.isArray(source)) continue
    for (const raw of source) {
      const r = raw as Record<string, unknown>
      items.push({
        comparendoNumber: String(r.numero ?? r.comparendo ?? r.numeroComparendo ?? ''),
        resolutionNumber: r.resolucion ? String(r.resolucion) : null,
        infractionDate: String(r.fechaInfraccion ?? r.fecha ?? ''),
        notificationDate: r.fechaNotificacion ? String(r.fechaNotificacion) : null,
        resolutionDate: r.fechaResolucion ? String(r.fechaResolucion) : null,
        cobroCoactivoDate: r.fechaCobroCoactivo ? String(r.fechaCobroCoactivo) : null,
        infractionCode: String(r.codigoInfraccion ?? r.infraccion ?? ''),
        infractionDescription: String(r.descripcionInfraccion ?? r.descripcion ?? ''),
        amount: Number(r.valorTotal ?? r.valor ?? 0),
        status: mapStatus(String(r.estado ?? 'pending')),
        cameraLocation: String(r.secretaria ?? r.direccion ?? ''),
        plate: plate.toUpperCase(),
      })
    }
  }

  if (items.length === 0) return null

  const persona = (data as { data?: { persona?: { nombre?: string } } }).data?.persona
  const vehiculo = (data as { data?: { vehiculo?: { tipo?: string; marca?: string } } }).data?.vehiculo

  return {
    plate: plate.toUpperCase(),
    ownerName: persona?.nombre ?? '',
    vehicleType: vehiculo?.tipo ?? '',
    vehicleBrand: vehiculo?.marca ?? '',
    fotomultas: items,
  }
}

function mapStatus(raw: string): FotomultaStatus {
  const lower = raw.toLowerCase()
  if (lower.includes('pago') || lower.includes('paid')) return 'paid'
  if (lower.includes('cobro') || lower.includes('coactivo')) return 'cobro_coactivo'
  if (lower.includes('resol')) return 'resolution'
  return 'pending'
}

async function scrapeRenderedTable(
  page: import('playwright').Page,
  plate: string,
): Promise<SimitResult | null> {
  const rows = await page.locator('table tbody tr').all()
  if (rows.length === 0) return null

  const items: Fotomulta[] = []
  for (const row of rows) {
    const cells = await row.locator('td').allTextContents()
    if (cells.length < 4) continue

    const amountStr = cells.find((c) => c.includes('$'))?.replace(/[^\d]/g, '') ?? '0'

    items.push({
      comparendoNumber: cells[0]?.trim() ?? '',
      resolutionNumber: null,
      infractionDate: cells[1]?.trim() ?? '',
      notificationDate: null,
      resolutionDate: null,
      cobroCoactivoDate: null,
      infractionCode: cells[4]?.trim() ?? '',
      infractionDescription: cells[4]?.trim() ?? '',
      amount: parseInt(amountStr, 10),
      status: 'pending',
      cameraLocation: cells[3]?.trim() ?? '',
      plate: plate.toUpperCase(),
    })
  }

  if (items.length === 0) return null

  return {
    plate: plate.toUpperCase(),
    ownerName: '',
    vehicleType: '',
    vehicleBrand: '',
    fotomultas: items,
  }
}
