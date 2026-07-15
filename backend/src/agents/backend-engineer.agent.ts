import { generatedFilesOutputSchema } from '@aisoftco/shared';

import { BACKEND_ENGINEER_SYSTEM_PROMPT } from './prompts/backend-engineer.prompt';
import { formatFeedback, formatPriorOutputs, formatProjectBrief, type AgentDefinition } from './types';

export const backendEngineerAgent: AgentDefinition = {
  type: 'backend_engineer',
  systemPrompt: BACKEND_ENGINEER_SYSTEM_PROMPT,
  schema: generatedFilesOutputSchema,
  buildUserMessage(context) {
    return `${formatProjectBrief(context)}\n\n${formatPriorOutputs(context)}` + formatFeedback(context);
  },
};
