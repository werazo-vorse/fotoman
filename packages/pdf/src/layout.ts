import { type PDFFont, type PDFPage, PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const PAGE_WIDTH = 595.28 // A4
const PAGE_HEIGHT = 841.89 // A4
const MARGIN_LEFT = 72
const MARGIN_RIGHT = 72
const MARGIN_TOP = 72
const MARGIN_BOTTOM = 72
const LINE_HEIGHT = 16
const PARAGRAPH_SPACING = 8

const TEXT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT

export interface LayoutContext {
  doc: PDFDocument
  font: PDFFont
  boldFont: PDFFont
  page: PDFPage
  y: number
  fontSize: number
}

export async function createLayoutContext(): Promise<LayoutContext> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold)
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])

  return {
    doc,
    font,
    boldFont,
    page,
    y: PAGE_HEIGHT - MARGIN_TOP,
    fontSize: 11,
  }
}

function ensureSpace(ctx: LayoutContext, needed: number): void {
  if (ctx.y - needed < MARGIN_BOTTOM) {
    ctx.page = ctx.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    ctx.y = PAGE_HEIGHT - MARGIN_TOP
  }
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const width = font.widthOfTextAtSize(testLine, fontSize)

    if (width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines.length > 0 ? lines : ['']
}

export function writeLine(ctx: LayoutContext, text: string, options?: {
  bold?: boolean
  fontSize?: number
  indent?: number
}): void {
  const { bold = false, fontSize = ctx.fontSize, indent = 0 } = options ?? {}
  const font = bold ? ctx.boldFont : ctx.font
  const maxWidth = TEXT_WIDTH - indent
  const lines = wrapText(text, font, fontSize, maxWidth)

  for (const line of lines) {
    ensureSpace(ctx, LINE_HEIGHT)
    ctx.page.drawText(line, {
      x: MARGIN_LEFT + indent,
      y: ctx.y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    })
    ctx.y -= LINE_HEIGHT
  }
}

export function writeBlankLine(ctx: LayoutContext): void {
  ctx.y -= PARAGRAPH_SPACING
}

export function writeSectionHeader(ctx: LayoutContext, title: string): void {
  writeBlankLine(ctx)
  writeLine(ctx, title, { bold: true, fontSize: 12 })
  writeBlankLine(ctx)
}

export function writeNumberedItem(ctx: LayoutContext, index: number, text: string, options?: {
  bold?: boolean
}): void {
  const prefix = `${index}. `
  const font = options?.bold ? ctx.boldFont : ctx.font
  const prefixWidth = font.widthOfTextAtSize(prefix, ctx.fontSize)
  const maxWidth = TEXT_WIDTH - prefixWidth
  const lines = wrapText(text, ctx.font, ctx.fontSize, maxWidth)

  for (let i = 0; i < lines.length; i++) {
    ensureSpace(ctx, LINE_HEIGHT)
    if (i === 0) {
      ctx.page.drawText(prefix, {
        x: MARGIN_LEFT,
        y: ctx.y,
        size: ctx.fontSize,
        font: options?.bold ? ctx.boldFont : ctx.font,
        color: rgb(0, 0, 0),
      })
    }
    ctx.page.drawText(lines[i]!, {
      x: MARGIN_LEFT + prefixWidth,
      y: ctx.y,
      size: ctx.fontSize,
      font: ctx.font,
      color: rgb(0, 0, 0),
    })
    ctx.y -= LINE_HEIGHT
  }
  ctx.y -= 4
}

export async function finalize(ctx: LayoutContext): Promise<Uint8Array> {
  return ctx.doc.save()
}
