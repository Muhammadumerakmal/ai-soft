import { architectOutputSchema } from '@aisoftco/shared';

import { ARCHITECT_SYSTEM_PROMPT } from './prompts/architect.prompt';
import { formatFeedback, formatPriorOutputs, formatProjectBrief, type AgentDefinition } from './types';

export const architectAgent: AgentDefinition = {
  type: 'architect',
  systemPrompt: ARCHITECT_SYSTEM_PROMPT,
  schema: architectOutputSchema,
  buildUserMessage(context) {
    return `${formatProjectBrief(context)}\n\n${formatPriorOutputs(context)}` + formatFeedback(context);
  },
};
