import { generatedFilesOutputSchema } from '@aisoftco/shared';

import { DOCUMENTATION_SYSTEM_PROMPT } from './prompts/documentation.prompt';
import { formatFeedback, formatPriorOutputs, formatProjectBrief, type AgentDefinition } from './types';

export const documentationAgent: AgentDefinition = {
  type: 'documentation',
  systemPrompt: DOCUMENTATION_SYSTEM_PROMPT,
  schema: generatedFilesOutputSchema,
  buildUserMessage(context) {
    return `${formatProjectBrief(context)}\n\n${formatPriorOutputs(context)}` + formatFeedback(context);
  },
};
