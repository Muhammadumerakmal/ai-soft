import { ceoOutputSchema } from '@aisoftco/shared';
import { CEO_SYSTEM_PROMPT } from './prompts/ceo.prompt';
import { formatFeedback, type AgentDefinition } from './types';

export const ceoAgent: AgentDefinition = {
  type: 'ceo',
  systemPrompt: CEO_SYSTEM_PROMPT,
  schema: ceoOutputSchema,
  buildUserMessage(context) {
    return (
      `Project title: ${context.project.title}\n\n` +
      `Project description:\n${context.project.description}\n\n` +
      `Requested tech stack (if any): ${context.project.techStack.join(', ') || 'none specified'}` +
      formatFeedback(context)
    );
  },
};
