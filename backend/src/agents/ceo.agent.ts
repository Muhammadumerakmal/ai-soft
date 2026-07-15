import { ceoOutputSchema } from '@aisoftco/shared';

import { CEO_SYSTEM_PROMPT } from './prompts/ceo.prompt';
import { formatFeedback, formatProjectBrief, type AgentDefinition } from './types';

export const ceoAgent: AgentDefinition = {
  type: 'ceo',
  systemPrompt: CEO_SYSTEM_PROMPT,
  schema: ceoOutputSchema,
  buildUserMessage(context) {
    return formatProjectBrief(context) + formatFeedback(context);
  },
};
