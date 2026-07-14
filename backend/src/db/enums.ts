import { pgEnum } from 'drizzle-orm/pg-core';

export const projectStatus = pgEnum('project_status', ['draft', 'running', 'completed', 'failed']);

export const workflowStatus = pgEnum('workflow_status', [
  'pending',
  'running',
  'completed',
  'failed',
  'awaiting_approval',
]);

export const agentStatus = pgEnum('agent_status', [
  'pending',
  'running',
  'completed',
  'failed',
  'awaiting_approval',
]);

export const agentType = pgEnum('agent_type', [
  'ceo',
  'pm',
  'architect',
  'ui_designer',
  'db_engineer',
  'backend_engineer',
  'frontend_engineer',
  'qa',
  'security',
  'devops',
  'documentation',
]);

export const teamRole = pgEnum('team_role', ['owner', 'admin', 'editor', 'viewer']);

export const deploymentStatus = pgEnum('deployment_status', [
  'pending',
  'building',
  'deploying',
  'live',
  'failed',
  'rolled_back',
]);

export const notificationType = pgEnum('notification_type', [
  'workflow_completed',
  'approval_required',
  'agent_failed',
  'project_shared',
  'system',
]);

export const taskStatus = pgEnum('task_status', ['pending', 'in_progress', 'completed', 'failed']);
