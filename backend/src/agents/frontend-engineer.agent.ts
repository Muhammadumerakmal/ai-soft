import { generatedFilesOutputSchema } from '@aisoftco/shared';

import { FRONTEND_ENGINEER_SYSTEM_PROMPT } from './prompts/frontend-engineer.prompt';
import { formatFeedback, formatPriorOutputs, formatProjectBrief, type AgentDefinition } from './types';

export const frontendEngineerAgent: AgentDefinition = {
  type: 'frontend_engineer',
  systemPrompt: FRONTEND_ENGINEER_SYSTEM_PROMPT,
  schema: generatedFilesOutputSchema,
  buildUserMessage(context) {
    return `${formatProjectBrief(context)}\n\n${formatPriorOutputs(context)}` + formatFeedback(context);
  },
};
