import { pmOutputSchema } from '@aisoftco/shared';

import { PM_SYSTEM_PROMPT } from './prompts/pm.prompt';
import { formatFeedback, formatPriorOutputs, formatProjectBrief, type AgentDefinition } from './types';

export const pmAgent: AgentDefinition = {
  type: 'pm',
  systemPrompt: PM_SYSTEM_PROMPT,
  schema: pmOutputSchema,
  buildUserMessage(context) {
    return `${formatProjectBrief(context)}\n\n${formatPriorOutputs(context)}` + formatFeedback(context);
  },
};
