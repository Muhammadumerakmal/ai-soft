import fs from 'fs/promises';
import path from 'path';

import type { AgentType, GeneratedFilesOutput } from '@aisoftco/shared';

import { db } from '../config/database';
import { projectFiles } from '../db/schema';
import { logger } from '../utils/logger';

const GENERATED_ROOT = path.resolve(__dirname, '../../../generated');

const FILE_TYPE_MAP: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.json': 'json',
  '.md': 'markdown',
  '.sql': 'sql',
  '.yml': 'yaml',
  '.yaml': 'yaml',
  '.css': 'css',
  '.html': 'html',
  '.env': 'env',
  '.dockerfile': 'dockerfile',
};

function inferFileType(filePath: string): string {
  const base = path.basename(filePath).toLowerCase();
  if (base === 'dockerfile') return 'dockerfile';
  const ext = path.extname(filePath).toLowerCase();
  return FILE_TYPE_MAP[ext] ?? 'text';
}

export class CodegenService {
  async writeGeneratedFiles(projectId: string, agentType: AgentType, output: GeneratedFilesOutput) {
    const projectRoot = path.join(GENERATED_ROOT, projectId);

    for (const file of output.files) {
      const target = path.resolve(path.join(projectRoot, file.path));

      if (!target.startsWith(projectRoot + path.sep) && target !== projectRoot) {
        logger.warn({ projectId, agentType, filePath: file.path }, 'Skipped unsafe generated file path');
        continue;
      }

      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, file.content, 'utf-8');

      await db.insert(projectFiles).values({
        projectId,
        filePath: path.relative(GENERATED_ROOT, target).replace(/\\/g, '/'),
        content: file.content,
        fileType: inferFileType(file.path),
        category: 'generated_code',
        agentType,
      });
    }

    logger.info(
      { projectId, agentType, fileCount: output.files.length },
      'Generated code files written'
    );
  }
}
