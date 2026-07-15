import { generatedFilesOutputSchema } from '@aisoftco/shared';

import { DB_ENGINEER_SYSTEM_PROMPT } from './prompts/db-engineer.prompt';
import { formatFeedback, formatPriorOutputs, formatProjectBrief, type AgentDefinition } from './types';

export const dbEngineerAgent: AgentDefinition = {
  type: 'db_engineer',
  systemPrompt: DB_ENGINEER_SYSTEM_PROMPT,
  schema: generatedFilesOutputSchema,
  buildUserMessage(context) {
    return `${formatProjectBrief(context)}\n\n${formatPriorOutputs(context)}` + formatFeedback(context);
  },
};
