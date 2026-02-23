export { createFotomanAgent, FOTOMAN_TOOLS } from './agent.js'
export type { FotomanAgentConfig } from './agent.js'
export { getSystemPrompt } from './system-prompt.js'
export {
  addBusinessDaysTool,
  calculateBusinessDaysTool,
  createPaymentTool,
  generateDocumentTool,
  getDefenseStrategyTool,
  getLegalReferenceTool,
  isBusinessDayTool,
  listAllDefensesTool,
  lookupFotomultasTool,
  submitPetitionTool,
  validateCitationTool,
} from './tools/index.js'
