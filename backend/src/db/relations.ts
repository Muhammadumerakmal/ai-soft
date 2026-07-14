import { relations } from 'drizzle-orm';
import { users } from './schema/users';
import { sessions } from './schema/sessions';
import { apiKeys } from './schema/api-keys';
import { organizations } from './schema/organizations';
import { teams } from './schema/teams';
import { memberships } from './schema/memberships';
import { projects } from './schema/projects';
import { projectRequirements } from './schema/project-requirements';
import { projectFiles } from './schema/project-files';
import { workflows } from './schema/workflows';
import { workflowSteps } from './schema/workflow-steps';
import { aiAgents } from './schema/ai-agents';
import { agentExecutions } from './schema/agent-executions';
import { agentOutputs } from './schema/agent-outputs';
import { aiConversations } from './schema/ai-conversations';
import { aiMessages } from './schema/ai-messages';
import { tasks } from './schema/tasks';
import { notifications } from './schema/notifications';
import { activityLogs } from './schema/activity-logs';
import { auditLogs } from './schema/audit-logs';
import { settings } from './schema/settings';

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  apiKeys: many(apiKeys),
  memberships: many(memberships),
  projects: many(projects),
  tasks: many(tasks),
  notifications: many(notifications),
  activityLogs: many(activityLogs),
  auditLogs: many(auditLogs),
  settings: many(settings),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  team: one(teams, { fields: [projects.teamId], references: [teams.id] }),
  requirements: many(projectRequirements),
  files: many(projectFiles),
  workflows: many(workflows),
  conversations: many(aiConversations),
  tasks: many(tasks),
  activityLogs: many(activityLogs),
}));

export const projectRequirementsRelations = relations(projectRequirements, ({ one }) => ({
  project: one(projects, { fields: [projectRequirements.projectId], references: [projects.id] }),
}));

export const projectFilesRelations = relations(projectFiles, ({ one }) => ({
  project: one(projects, { fields: [projectFiles.projectId], references: [projects.id] }),
}));

export const workflowsRelations = relations(workflows, ({ one, many }) => ({
  project: one(projects, { fields: [workflows.projectId], references: [projects.id] }),
  steps: many(workflowSteps),
}));

export const workflowStepsRelations = relations(workflowSteps, ({ one, many }) => ({
  workflow: one(workflows, { fields: [workflowSteps.workflowId], references: [workflows.id] }),
  executions: many(agentExecutions),
  outputs: many(agentOutputs),
}));

export const aiAgentsRelations = relations(aiAgents, ({ many }) => ({
  executions: many(agentExecutions),
}));

export const agentExecutionsRelations = relations(agentExecutions, ({ one }) => ({
  workflowStep: one(workflowSteps, { fields: [agentExecutions.workflowStepId], references: [workflowSteps.id] }),
  agent: one(aiAgents, { fields: [agentExecutions.agentId], references: [aiAgents.id] }),
}));

export const agentOutputsRelations = relations(agentOutputs, ({ one }) => ({
  workflowStep: one(workflowSteps, { fields: [agentOutputs.workflowStepId], references: [workflowSteps.id] }),
}));

export const aiConversationsRelations = relations(aiConversations, ({ one, many }) => ({
  project: one(projects, { fields: [aiConversations.projectId], references: [projects.id] }),
  messages: many(aiMessages),
}));

export const aiMessagesRelations = relations(aiMessages, ({ one }) => ({
  conversation: one(aiConversations, { fields: [aiMessages.conversationId], references: [aiConversations.id] }),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  teams: many(teams),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  organization: one(organizations, { fields: [teams.organizationId], references: [organizations.id] }),
  memberships: many(memberships),
  projects: many(projects),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  team: one(teams, { fields: [memberships.teamId], references: [teams.id] }),
  user: one(users, { fields: [memberships.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, { fields: [apiKeys.userId], references: [users.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  assignee: one(users, { fields: [tasks.assignedTo], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
  project: one(projects, { fields: [activityLogs.projectId], references: [projects.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));

export const settingsRelations = relations(settings, ({ one }) => ({
  user: one(users, { fields: [settings.userId], references: [users.id] }),
}));
