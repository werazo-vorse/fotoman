import type { CreatePaymentInput, PaymentLink, PaymentResult, PaymentStatus } from './types.js'

export type { CreatePaymentInput, PaymentLink, PaymentResult, PaymentStatus }

const WOMPI_API_URL = 'https://production.wompi.co/v1'
const WOMPI_SANDBOX_URL = 'https://sandbox.wompi.co/v1'

function getConfig() {
  const privateKey = process.env['WOMPI_PRIVATE_KEY'] ?? ''
  const publicKey = process.env['WOMPI_PUBLIC_KEY'] ?? ''
  const isSandbox = privateKey.startsWith('prv_test_') || !privateKey
  return {
    privateKey,
    publicKey,
    baseUrl: isSandbox ? WOMPI_SANDBOX_URL : WOMPI_API_URL,
  }
}

export async function createPaymentLink(input: CreatePaymentInput): Promise<PaymentLink> {
  const config = getConfig()
  const reference = `fotoman-${input.caseId}-${Date.now()}`

  if (!config.privateKey) {
    return createMockPaymentLink(reference, input.amountInCents)
  }

  try {
    const res = await fetch(`${config.baseUrl}/payment_links`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.privateKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `Fotoman - ${input.description}`,
        description: input.description,
        single_use: true,
        collect_shipping: false,
        currency: 'COP',
        amount_in_cents: input.amountInCents,
        redirect_url: input.redirectUrl,
        customer_data: {
          customer_references: [{ label: 'case_id', value: input.caseId }],
        },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Wompi API error: ${res.status} ${err}`)
    }

    const data = (await res.json()) as {
      data: { id: string; url: string }
    }

    return {
      id: data.data.id,
      url: data.data.url,
      reference,
      amountInCents: input.amountInCents,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payment link creation failed'
    throw new Error(message)
  }
}

export async function getPaymentStatus(transactionId: string): Promise<PaymentResult> {
  const config = getConfig()

  if (!config.privateKey) {
    return { success: true, status: 'APPROVED', reference: `mock-${transactionId}` }
  }

  try {
    const res = await fetch(`${config.baseUrl}/transactions/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${config.privateKey}`,
      },
    })

    if (!res.ok) {
      return { success: false, status: 'ERROR', error: `HTTP ${res.status}` }
    }

    const data = (await res.json()) as {
      data: { status: string; reference: string }
    }

    return {
      success: data.data.status === 'APPROVED',
      status: data.data.status as PaymentStatus,
      reference: data.data.reference,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payment status check failed'
    return { success: false, status: 'ERROR', error: message }
  }
}

export function formatAmountCOP(amountInCents: number): string {
  const amount = amountInCents / 100
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount)
}

function createMockPaymentLink(reference: string, amountInCents: number): PaymentLink {
  console.log(`[MOCK PAYMENT] Reference: ${reference}, Amount: ${formatAmountCOP(amountInCents)}`)
  return {
    id: `mock-link-${Date.now()}`,
    url: `https://checkout.wompi.co/mock/${reference}`,
    reference,
    amountInCents,
  }
}

export const FOTOMULTA_FEE_COP_CENTS = 5000000 // $50,000 COP per fotomulta
