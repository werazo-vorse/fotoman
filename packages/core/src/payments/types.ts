export type PaymentStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR'

export interface PaymentLink {
  id: string
  url: string
  reference: string
  amountInCents: number
}

export interface CreatePaymentInput {
  caseId: string
  amountInCents: number
  description: string
  customerEmail: string
  redirectUrl?: string
}

export interface PaymentResult {
  success: boolean
  status: PaymentStatus
  reference?: string
  error?: string
}
