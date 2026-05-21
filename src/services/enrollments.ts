export type EnrollmentAuditContext = {
  targetUserId: string;
  paymentProvider?: string | null;
  paymentReference?: string | null;
  expiresAt?: string | null;
  previousStatus?: string;
};

export function enrollmentAuditMetadata(input: EnrollmentAuditContext): Record<string, string | null> {
  return {
    targetUserId: input.targetUserId,
    paymentProvider: input.paymentProvider ?? null,
    paymentReference: input.paymentReference ?? null,
    expiresAt: input.expiresAt ?? null,
    previousStatus: input.previousStatus ?? null
  };
}
