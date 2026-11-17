import { headers } from 'next/headers';
import { AuditLog } from '@/models';
import type { SessionUser } from './tenant';

type AuditInput = {
  actor?: SessionUser | null;
  storeId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  reason?: string | null;
};

/**
 * Auditoría best-effort: nunca debe tumbar la operación principal.
 * `AuditLog` es append-only (los hooks del modelo bloquean updates/deletes).
 */
export async function recordAudit(input: AuditInput): Promise<void> {
  try {
    const headerList = await headers();

    await AuditLog.create({
      actorId: input.actor?.id ?? null,
      actorEmail: input.actor?.email ?? null,
      actorRole: input.actor?.role ?? null,
      storeId: input.storeId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      before: input.before ?? null,
      after: input.after ?? null,
      metadata: {
        ip: headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
        userAgent: headerList.get('user-agent') ?? null,
        requestId: headerList.get('x-request-id') ?? null,
        reason: input.reason ?? null,
      },
    });
  } catch (error) {
    console.error('[audit] no se pudo registrar la acción', input.action, error);
  }
}
