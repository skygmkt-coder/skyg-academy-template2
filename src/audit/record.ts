import { createClient } from "@/lib/supabase/server";
import type { AuditEventResult, RecordAuditEventInput } from "@/src/audit/types";

type InsertResult = { error: { message: string } | null };

type AuditEventsTable = {
  insert: (values: Record<string, unknown>) => Promise<InsertResult>;
};

type AuditClient = {
  from: (table: "audit_events") => AuditEventsTable;
};

function warnAudit(message: string, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[audit] ${message}`, context ?? {});
    return;
  }

  console.warn(JSON.stringify({ level: "warn", scope: "audit", message, ...context }));
}

export async function recordAuditEvent(input: RecordAuditEventInput): Promise<AuditEventResult> {
  if (!input.actorUserId) {
    warnAudit("Audit event skipped because actorUserId is missing.", { eventType: input.eventType });
    return { recorded: false, reason: "missing_actor" };
  }

  try {
    const supabase = (await createClient()) as unknown as AuditClient;
    const { error } = await supabase.from("audit_events").insert({
      event_type: input.eventType,
      actor_user_id: input.actorUserId,
      target_type: input.targetType,
      target_id: input.targetId ?? null,
      course_id: input.courseId ?? null,
      metadata: input.metadata ?? {}
    });

    if (error) {
      if (input.failClosed) {
        throw new Error(error.message);
      }

      warnAudit("Audit event insert failed.", { eventType: input.eventType, message: error.message });
      return { recorded: false, reason: "insert_failed", message: error.message };
    }

    return { recorded: true };
  } catch (error) {
    if (input.failClosed) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Unknown audit logging error";
    warnAudit("Audit event recorder failed.", { eventType: input.eventType, message });
    return { recorded: false, reason: "insert_failed", message };
  }
}
