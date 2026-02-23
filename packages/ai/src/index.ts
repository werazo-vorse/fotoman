export { createFotomanAgent, FOTOMAN_TOOLS } from './agent.js'
export type { FotomanAgentConfig } from './agent.js'
export { getSystemPrompt } from './system-prompt.js'
export {
  addBusinessDaysTool,
  calculateBusinessDaysTool,
  generateDocumentTool,
  getDefenseStrategyTool,
  getLegalReferenceTool,
  isBusinessDayTool,
  listAllDefensesTool,
  lookupFotomultasTool,
  validateCitationTool,
} from './tools/index.js'
