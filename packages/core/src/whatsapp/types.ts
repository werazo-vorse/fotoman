export interface WhatsAppWebhookBody {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        metadata: {
          display_phone_number: string
          phone_number_id: string
        }
        contacts?: Array<{
          profile: { name: string }
          wa_id: string
        }>
        messages?: Array<{
          from: string
          id: string
          timestamp: string
          type: string
          text?: { body: string }
        }>
        statuses?: Array<{
          id: string
          status: string
          timestamp: string
          recipient_id: string
        }>
      }
      field: string
    }>
  }>
}

export interface WhatsAppMessage {
  from: string
  name: string
  text: string
  messageId: string
  timestamp: string
}

export interface SendMessageOptions {
  to: string
  text: string
}

export interface SendDocumentOptions {
  to: string
  documentBase64: string
  filename: string
  caption?: string
}
