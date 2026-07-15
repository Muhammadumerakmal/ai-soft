import { generatedFilesOutputSchema } from '@aisoftco/shared';

import { UI_DESIGNER_SYSTEM_PROMPT } from './prompts/ui-designer.prompt';
import { formatFeedback, formatPriorOutputs, formatProjectBrief, type AgentDefinition } from './types';

export const uiDesignerAgent: AgentDefinition = {
  type: 'ui_designer',
  systemPrompt: UI_DESIGNER_SYSTEM_PROMPT,
  schema: generatedFilesOutputSchema,
  buildUserMessage(context) {
    return `${formatProjectBrief(context)}\n\n${formatPriorOutputs(context)}` + formatFeedback(context);
  },
};
