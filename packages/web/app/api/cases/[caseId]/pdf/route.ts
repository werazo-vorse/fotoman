import { getCaseDocument } from '@fotoman/db'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const { caseId } = await params

  try {
    const pdf = await getCaseDocument(caseId)

    if (!pdf) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return new Response(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="derecho-de-peticion-${caseId}.pdf"`,
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Database not available' },
      { status: 503 },
    )
  }
}
