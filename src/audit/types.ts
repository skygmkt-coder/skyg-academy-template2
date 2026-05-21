export type AuditEventType =
  | "media.upload.signed"
  | "media.delete"
  | "enrollment.grant"
  | "enrollment.revoke"
  | "payment.approve"
  | "course_payment_proof.approve";

export type AuditTargetType =
  | "media"
  | "enrollment"
  | "payment"
  | "payment_proof"
  | "course"
  | "user";

export type AuditMetadataValue =
  | string
  | number
  | boolean
  | null
  | AuditMetadataValue[]
  | { [key: string]: AuditMetadataValue };

export type AuditMetadata = Record<string, AuditMetadataValue>;

export type RecordAuditEventInput = {
  eventType: AuditEventType;
  actorUserId: string | null | undefined;
  targetType: AuditTargetType;
  targetId?: string | null;
  courseId?: string | null;
  metadata?: AuditMetadata;
  failClosed?: boolean;
};

export type AuditEventResult =
  | { recorded: true }
  | { recorded: false; reason: "missing_actor" | "insert_failed"; message?: string };
