import { generatedFilesOutputSchema } from '@aisoftco/shared';

import { QA_SYSTEM_PROMPT } from './prompts/qa.prompt';
import { formatFeedback, formatPriorOutputs, formatProjectBrief, type AgentDefinition } from './types';

export const qaAgent: AgentDefinition = {
  type: 'qa',
  systemPrompt: QA_SYSTEM_PROMPT,
  schema: generatedFilesOutputSchema,
  buildUserMessage(context) {
    return `${formatProjectBrief(context)}\n\n${formatPriorOutputs(context)}` + formatFeedback(context);
  },
};
