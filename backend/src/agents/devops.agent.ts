import { generatedFilesOutputSchema } from '@aisoftco/shared';

import { DEVOPS_SYSTEM_PROMPT } from './prompts/devops.prompt';
import { formatFeedback, formatPriorOutputs, formatProjectBrief, type AgentDefinition } from './types';

export const devopsAgent: AgentDefinition = {
  type: 'devops',
  systemPrompt: DEVOPS_SYSTEM_PROMPT,
  schema: generatedFilesOutputSchema,
  buildUserMessage(context) {
    return `${formatProjectBrief(context)}\n\n${formatPriorOutputs(context)}` + formatFeedback(context);
  },
};
