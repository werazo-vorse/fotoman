import { createPaymentLink, FOTOMULTA_FEE_COP_CENTS } from '@fotoman/core/payments'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = (await req.json()) as {
    amountInCents: number
    description: string
    customerEmail: string
  }

  if (!body.amountInCents || body.amountInCents < FOTOMULTA_FEE_COP_CENTS) {
    return NextResponse.json({ error: 'Monto invalido' }, { status: 400 })
  }

  try {
    const link = await createPaymentLink({
      caseId: `web-${Date.now()}`,
      amountInCents: body.amountInCents,
      description: body.description,
      customerEmail: body.customerEmail,
    })

    return NextResponse.json({
      url: link.url,
      reference: link.reference,
      amountInCents: link.amountInCents,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error creating payment'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
