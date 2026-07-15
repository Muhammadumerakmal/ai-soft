import { generatedFilesOutputSchema } from '@aisoftco/shared';

import { DB_ENGINEER_SYSTEM_PROMPT } from './prompts/db-engineer.prompt';
import { formatFeedback, formatPriorOutputs, type AgentDefinition } from './types';

export const dbEngineerAgent: AgentDefinition = {
  type: 'db_engineer',
  systemPrompt: DB_ENGINEER_SYSTEM_PROMPT,
  schema: generatedFilesOutputSchema,
  buildUserMessage(context) {
    return (
      `Project title: ${context.project.title}\n\n` +
      `Project description:\n${context.project.description}\n\n` +
      `Requested tech stack (if any): ${context.project.techStack.join(', ') || 'none specified'}\n\n` +
      `${formatPriorOutputs(context)}` +
      formatFeedback(context)
    );
  },
};
