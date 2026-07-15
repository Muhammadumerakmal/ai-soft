import fs from 'fs/promises';
import path from 'path';

import type { AgentType, CEOOutput, PMOutput, ArchitectOutput } from '@aisoftco/shared';

import { db } from '../config/database';
import { projectFiles } from '../db/schema';
import { logger } from '../utils/logger';

const DOCS_ROOT = path.resolve(__dirname, '../../../docs');

const FILE_NAMES: Partial<Record<AgentType, string>> = {
  ceo: 'charter.md',
  pm: 'prd.md',
  architect: 'architecture.md',
};

function renderCeo(output: CEOOutput): string {
  return [
    '# Project Charter',
    '',
    `## Vision`,
    output.vision,
    '',
    `## Scope`,
    output.scope,
    '',
    `## Target Audience`,
    ...output.targetAudience.map((item) => `- ${item}`),
    '',
    `## Success Criteria`,
    ...output.successCriteria.map((item) => `- ${item}`),
    '',
    `## Recommended Tech Stack`,
    ...output.techStack.map((item) => `- ${item}`),
    ...(output.constraints?.length ? ['', '## Constraints', ...output.constraints.map((c) => `- ${c}`)] : []),
    ...(output.clarifyingQuestions?.length
      ? ['', '## Open Questions', ...output.clarifyingQuestions.map((q) => `- ${q}`)]
      : []),
    '',
  ].join('\n');
}

function renderPm(output: PMOutput): string {
  return [
    '# Product Requirements Document',
    '',
    '## Product Overview',
    output.productOverview,
    '',
    '## Target Personas',
    ...output.targetPersonas.map((item) => `- ${item}`),
    '',
    '## User Stories',
    ...output.userStories.flatMap((story) => [
      `### ${story.title} (${story.priority})`,
      `As a ${story.asA}, I want ${story.iWant}, so that ${story.soThat}.`,
      '',
      'Acceptance Criteria:',
      ...story.acceptanceCriteria.map((ac) => `- ${ac}`),
      '',
    ]),
    '## Feature List',
    ...output.featureList.map((item) => `- ${item}`),
    ...(output.nonFunctionalRequirements?.length
      ? ['', '## Non-Functional Requirements', ...output.nonFunctionalRequirements.map((r) => `- ${r}`)]
      : []),
    ...(output.outOfScope?.length ? ['', '## Out of Scope', ...output.outOfScope.map((r) => `- ${r}`)] : []),
    ...(output.openQuestions?.length ? ['', '## Open Questions', ...output.openQuestions.map((r) => `- ${r}`)] : []),
    '',
  ].join('\n');
}

function renderArchitect(output: ArchitectOutput): string {
  return [
    '# Architecture Document',
    '',
    '## System Overview',
    output.systemOverview,
    '',
    `## Architecture Style`,
    output.architectureStyle,
    '',
    '## Components',
    ...output.components.flatMap((c) => [`### ${c.name}`, `Responsibility: ${c.responsibility}`, `Technology: ${c.technology}`, '']),
    '## Data Model',
    ...output.dataModel.flatMap((entity) => [
      `### ${entity.entity}`,
      `Fields: ${entity.fields.join(', ')}`,
      ...(entity.relationships?.length ? [`Relationships: ${entity.relationships.join(', ')}`] : []),
      '',
    ]),
    '## API Endpoints',
    ...output.apiEndpoints.map((ep) => `- \`${ep.method} ${ep.path}\` — ${ep.description}`),
    '',
    '## Tech Stack',
    ...output.techStack.map((item) => `- ${item}`),
    ...(output.risks?.length ? ['', '## Risks', ...output.risks.map((r) => `- ${r}`)] : []),
    '',
  ].join('\n');
}

function renderDocument(agentType: AgentType, output: Record<string, unknown>): string {
  switch (agentType) {
    case 'ceo':
      return renderCeo(output as CEOOutput);
    case 'pm':
      return renderPm(output as PMOutput);
    case 'architect':
      return renderArchitect(output as ArchitectOutput);
    default:
      return `# ${agentType}\n\n\`\`\`json\n${JSON.stringify(output, null, 2)}\n\`\`\`\n`;
  }
}

export class DocumentService {
  async generate(projectId: string, agentType: AgentType, output: Record<string, unknown>) {
    const fileName = FILE_NAMES[agentType] ?? `${agentType}.md`;
    const content = renderDocument(agentType, output);

    const projectDir = path.join(DOCS_ROOT, projectId);
    await fs.mkdir(projectDir, { recursive: true });
    const filePath = path.join(projectDir, fileName);
    await fs.writeFile(filePath, content, 'utf-8');

    await db.insert(projectFiles).values({
      projectId,
      filePath: path.relative(DOCS_ROOT, filePath).replace(/\\/g, '/'),
      content,
      fileType: 'markdown',
      category: 'document',
      agentType,
    });

    logger.info({ projectId, agentType, filePath }, 'Generated document');
    return filePath;
  }
}
