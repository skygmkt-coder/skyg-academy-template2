export const COURSE_PAYMENT_TYPES = ["free", "transfer", "dimo", "mixed"] as const;

export const CHECKOUT_PAYMENT_METHODS = ["transferencia", "dimo"] as const;

export const PAYMENT_PROOF_STATUSES = ["pending", "approved", "rejected"] as const;

export const PAYMENT_PROVIDERS = {
  FREE: "free",
  MANUAL: "manual",
  MANUAL_PROOF: "manual-proof",
  SELF_ENROLLMENT: "self-enrollment"
} as const;
