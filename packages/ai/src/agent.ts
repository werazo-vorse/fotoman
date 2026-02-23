import type { LanguageModel, ModelMessage } from 'ai'
import { stepCountIs, streamText } from 'ai'
import { getSystemPrompt } from './system-prompt.js'
import {
  addBusinessDaysTool,
  calculateBusinessDaysTool,
  generateDocumentTool,
  getDefenseStrategyTool,
  getLegalReferenceTool,
  isBusinessDayTool,
  listAllDefensesTool,
  lookupFotomultasTool,
  submitPetitionTool,
  validateCitationTool,
} from './tools/index.js'

export const FOTOMAN_TOOLS = {
  lookup_fotomultas: lookupFotomultasTool,
  calculate_business_days: calculateBusinessDaysTool,
  add_business_days: addBusinessDaysTool,
  is_business_day: isBusinessDayTool,
  get_legal_reference: getLegalReferenceTool,
  get_defense_strategy: getDefenseStrategyTool,
  list_all_defenses: listAllDefensesTool,
  validate_citation: validateCitationTool,
  generate_document: generateDocumentTool,
  submit_petition: submitPetitionTool,
} as const

export interface FotomanAgentConfig {
  model: LanguageModel
  maxSteps?: number
}

export function createFotomanAgent(config: FotomanAgentConfig) {
  const { model, maxSteps = 10 } = config
  const systemPrompt = getSystemPrompt()

  function chat(messages: ModelMessage[]) {
    return streamText({
      model,
      system: systemPrompt,
      messages,
      tools: FOTOMAN_TOOLS,
      stopWhen: stepCountIs(maxSteps),
    })
  }

  return { chat }
}
