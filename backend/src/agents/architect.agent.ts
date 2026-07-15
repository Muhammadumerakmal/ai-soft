import { architectOutputSchema } from '@aisoftco/shared';

import { ARCHITECT_SYSTEM_PROMPT } from './prompts/architect.prompt';
import { formatFeedback, formatPriorOutputs, type AgentDefinition } from './types';

export const architectAgent: AgentDefinition = {
  type: 'architect',
  systemPrompt: ARCHITECT_SYSTEM_PROMPT,
  schema: architectOutputSchema,
  buildUserMessage(context) {
    return (
      `Project title: ${context.project.title}\n\n` +
      `Project description:\n${context.project.description}\n\n` +
      `${formatPriorOutputs(context)}` +
      formatFeedback(context)
    );
  },
};
