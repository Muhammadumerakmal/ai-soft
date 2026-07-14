import { pmOutputSchema } from '@aisoftco/shared';
import { PM_SYSTEM_PROMPT } from './prompts/pm.prompt';
import { formatFeedback, formatPriorOutputs, type AgentDefinition } from './types';

export const pmAgent: AgentDefinition = {
  type: 'pm',
  systemPrompt: PM_SYSTEM_PROMPT,
  schema: pmOutputSchema,
  buildUserMessage(context) {
    return (
      `Project title: ${context.project.title}\n\n` +
      `Project description:\n${context.project.description}\n\n` +
      `${formatPriorOutputs(context)}` +
      formatFeedback(context)
    );
  },
};
