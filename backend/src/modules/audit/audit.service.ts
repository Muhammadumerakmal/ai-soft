import { db } from '../../db/index.js';
import { auditLogs } from '../../db/schema/audit-logs.js';

export interface AuditEntry {
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  await db.insert(auditLogs).values({
    userId: entry.userId ?? null,
    action: entry.action,
    resource: entry.resource,
    resourceId: entry.resourceId ?? null,
    details: entry.details ?? null,
    ip: entry.ip ?? null,
    userAgent: entry.userAgent ?? null,
  });
}
