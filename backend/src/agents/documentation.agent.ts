import { generatedFilesOutputSchema } from '@aisoftco/shared';

import { DOCUMENTATION_SYSTEM_PROMPT } from './prompts/documentation.prompt';
import { formatFeedback, formatPriorOutputs, type AgentDefinition } from './types';

export const documentationAgent: AgentDefinition = {
  type: 'documentation',
  systemPrompt: DOCUMENTATION_SYSTEM_PROMPT,
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
