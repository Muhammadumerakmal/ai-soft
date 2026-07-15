import { generatedFilesOutputSchema } from '@aisoftco/shared';

import { FRONTEND_ENGINEER_SYSTEM_PROMPT } from './prompts/frontend-engineer.prompt';
import { formatFeedback, formatPriorOutputs, type AgentDefinition } from './types';

export const frontendEngineerAgent: AgentDefinition = {
  type: 'frontend_engineer',
  systemPrompt: FRONTEND_ENGINEER_SYSTEM_PROMPT,
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
