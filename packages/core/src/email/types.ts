export interface SubmissionInput {
  toEmail: string
  ccEmail: string
  subject: string
  bodyText: string
  pdfBuffer: Uint8Array
  pdfFilename: string
  petitionerName: string
}

export interface SubmissionResult {
  success: boolean
  messageId?: string
  error?: string
}
