import { generatedFilesOutputSchema } from '@aisoftco/shared';

import { UI_DESIGNER_SYSTEM_PROMPT } from './prompts/ui-designer.prompt';
import { formatFeedback, formatPriorOutputs, type AgentDefinition } from './types';

export const uiDesignerAgent: AgentDefinition = {
  type: 'ui_designer',
  systemPrompt: UI_DESIGNER_SYSTEM_PROMPT,
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
