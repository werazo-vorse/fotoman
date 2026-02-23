import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma
}

export { PrismaClient }
export type {
  User,
  Vehicle,
  Fotomulta,
  Case,
  CaseFotomulta,
  CaseEvent,
  Message,
  Platform,
  CaseStatus,
  CaseEventType,
  FotomultaStatus,
} from '@prisma/client'

export {
  createCase,
  getCaseDocument,
  getCasesByUser,
  getCaseWithDetails,
  storeCaseDocument,
  updateCaseStatus,
} from './cases.js'
export { getMessagesByCase, saveMessage } from './messages.js'
export { findOrCreateUser, findUserByCedula, findUserByPhone } from './users.js'
