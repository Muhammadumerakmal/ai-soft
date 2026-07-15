import { generatedFilesOutputSchema } from '@aisoftco/shared';

import { DEVOPS_SYSTEM_PROMPT } from './prompts/devops.prompt';
import { formatFeedback, formatPriorOutputs, type AgentDefinition } from './types';

export const devopsAgent: AgentDefinition = {
  type: 'devops',
  systemPrompt: DEVOPS_SYSTEM_PROMPT,
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
