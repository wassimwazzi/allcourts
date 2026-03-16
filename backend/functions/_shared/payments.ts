import { describeEnv, missingRequiredEnv, type EnvRequirement } from "./env.ts";
import { HttpError } from "./http.ts";

export type BookingCheckoutRequest = {
  courtId?: string;
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  subtotalCents?: number;
  discountCents?: number;
  taxCents?: number;
  totalCents?: number;
  platformFeeCents?: number;
  currency?: string;
  bookedForName?: string;
  bookedForPhone?: string;
  notes?: string;
  checkoutContext?: Record<string, unknown>;
};

export type BookingCheckoutResponse = {
  requestId: string;
  bookingId: string;
  status: string;
  paymentStatus: string;
  amountCents: number;
  currency: string;
  idempotencyKey: string;
  idempotencyKeySource: "header" | "generated";
  paymentProvider: "stripe";
  mode: "placeholder";
  replayed: boolean;
  providerReference: string;
  stripe: {
    publishableKeyConfigured: boolean;
    secretKeyConfigured: boolean;
    webhookSecretConfigured: boolean;
    readyForProviderCall: boolean;
    readyForWebhookVerification: boolean;
    checkoutSessionCreated: boolean;
    paymentIntentCreated: boolean;
  };
  handoff: {
    nextAction: string;
    notes: string[];
  };
  warnings: string[];
};

export type StripeWebhookResponse = {
  requestId: string;
  webhookEventId: string;
  provider: "stripe";
  eventId: string;
  eventType: string;
  status: string;
  duplicate: boolean;
  verified: boolean;
  verificationState: "secret_not_configured" | "missing_signature" | "signature_present_not_verified";
  payloadDigest: string;
  handoff: {
    nextAction: string;
    notes: string[];
  };
  warnings: string[];
};

type BookingCheckoutEnvStatus = {
  requirements: EnvRequirement[];
  missingRequired: string[];
  publishableKeyConfigured: boolean;
  secretKeyConfigured: boolean;
  webhookSecretConfigured: boolean;
  readyForProviderCall: boolean;
  readyForWebhookVerification: boolean;
};

type StripeWebhookEnvStatus = {
  requirements: EnvRequirement[];
  missingRequired: string[];
  webhookSecretConfigured: boolean;
  readyForWebhookVerification: boolean;
};

export const bookingCheckoutEnvRequirements: Array<Omit<EnvRequirement, "configured">> = [
  {
    name: "SUPABASE_URL",
    required: true,
    purpose: "Edge function admin client target.",
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    required: true,
    purpose: "Privileged writes for provisional bookings and payment attempts.",
  },
  {
    name: "STRIPE_SECRET_KEY",
    required: false,
    purpose: "Needed once the scaffold starts creating Checkout Sessions or PaymentIntents.",
  },
  {
    name: "STRIPE_PUBLISHABLE_KEY",
    required: false,
    purpose: "Needed if the client will receive Stripe checkout configuration.",
  },
  {
    name: "STRIPE_WEBHOOK_SECRET",
    required: false,
    purpose: "Needed once webhook signature verification is enabled.",
  },
];

export const stripeWebhookEnvRequirements: Array<Omit<EnvRequirement, "configured">> = [
  {
    name: "SUPABASE_URL",
    required: true,
    purpose: "Edge function admin client target.",
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    required: true,
    purpose: "Privileged webhook receipt persistence.",
  },
  {
    name: "STRIPE_WEBHOOK_SECRET",
    required: false,
    purpose: "Needed for cryptographic verification of Stripe webhook signatures.",
  },
];

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const isoTimePattern = /^\d{2}:\d{2}(:\d{2})?$/;

function assertPresentText(value: string | undefined, field: string): string {
  const normalized = value?.trim();
  if (!normalized) {
    throw new HttpError(400, "invalid_request", `${field} is required.`, { field });
  }
  return normalized;
}

function assertPattern(value: string, pattern: RegExp, field: string, example: string): string {
  if (!pattern.test(value)) {
    throw new HttpError(400, "invalid_request", `${field} must match ${example}.`, {
      field,
      value,
    });
  }
  return value;
}

export function isNonNegativeInteger(value: number | undefined): value is number {
  return Number.isInteger(value) && value >= 0;
}

export function normalizeCurrency(currency?: string): string {
  const normalized = (currency ?? "usd").trim().toLowerCase();
  if (!/^[a-z]{3}$/.test(normalized)) {
    throw new HttpError(400, "invalid_currency", "currency must be a three-letter ISO currency code.", {
      currency,
    });
  }
  return normalized;
}

export function getCheckoutEnvStatus(): BookingCheckoutEnvStatus {
  const requirements = describeEnv(bookingCheckoutEnvRequirements);
  const configuredByName = Object.fromEntries(requirements.map((requirement) => [
    requirement.name,
    requirement.configured,
  ]));

  return {
    requirements,
    missingRequired: missingRequiredEnv(requirements),
    publishableKeyConfigured: Boolean(configuredByName.STRIPE_PUBLISHABLE_KEY),
    secretKeyConfigured: Boolean(configuredByName.STRIPE_SECRET_KEY),
    webhookSecretConfigured: Boolean(configuredByName.STRIPE_WEBHOOK_SECRET),
    readyForProviderCall: Boolean(configuredByName.STRIPE_SECRET_KEY),
    readyForWebhookVerification: Boolean(configuredByName.STRIPE_WEBHOOK_SECRET),
  };
}

export function getWebhookEnvStatus(): StripeWebhookEnvStatus {
  const requirements = describeEnv(stripeWebhookEnvRequirements);
  const configuredByName = Object.fromEntries(requirements.map((requirement) => [
    requirement.name,
    requirement.configured,
  ]));

  return {
    requirements,
    missingRequired: missingRequiredEnv(requirements),
    webhookSecretConfigured: Boolean(configuredByName.STRIPE_WEBHOOK_SECRET),
    readyForWebhookVerification: Boolean(configuredByName.STRIPE_WEBHOOK_SECRET),
  };
}

export function normalizeBookingCheckoutRequest(body: BookingCheckoutRequest) {
  const courtId = assertPresentText(body.courtId, "courtId");
  const bookingDate = assertPattern(
    assertPresentText(body.bookingDate, "bookingDate"),
    isoDatePattern,
    "bookingDate",
    "YYYY-MM-DD",
  );
  const startTime = assertPattern(
    assertPresentText(body.startTime, "startTime"),
    isoTimePattern,
    "startTime",
    "HH:MM or HH:MM:SS",
  );
  const endTime = assertPattern(
    assertPresentText(body.endTime, "endTime"),
    isoTimePattern,
    "endTime",
    "HH:MM or HH:MM:SS",
  );

  if (startTime >= endTime) {
    throw new HttpError(400, "invalid_request", "endTime must be later than startTime.", {
      startTime,
      endTime,
    });
  }

  const subtotalCents = body.subtotalCents;
  const discountCents = body.discountCents ?? 0;
  const taxCents = body.taxCents ?? 0;
  const platformFeeCents = body.platformFeeCents ?? 0;

  if (
    !isNonNegativeInteger(subtotalCents) ||
    !isNonNegativeInteger(discountCents) ||
    !isNonNegativeInteger(taxCents) ||
    !isNonNegativeInteger(platformFeeCents)
  ) {
    throw new HttpError(
      400,
      "invalid_amounts",
      "subtotalCents is required; discountCents, taxCents, and platformFeeCents must be non-negative integers.",
      {
        subtotalCents,
        discountCents,
        taxCents,
        platformFeeCents,
      },
    );
  }

  const computedTotal = subtotalCents - discountCents + taxCents;
  const totalCents = body.totalCents ?? computedTotal;
  if (!isNonNegativeInteger(totalCents) || totalCents !== computedTotal) {
    throw new HttpError(
      400,
      "invalid_amounts",
      "totalCents must equal subtotalCents - discountCents + taxCents.",
      {
        subtotalCents,
        discountCents,
        taxCents,
        totalCents,
        computedTotal,
      },
    );
  }

  return {
    courtId,
    bookingDate,
    startTime,
    endTime,
    timezone: body.timezone?.trim() || "UTC",
    subtotalCents,
    discountCents,
    taxCents,
    totalCents,
    platformFeeCents,
    currency: normalizeCurrency(body.currency),
    bookedForName: body.bookedForName?.trim() || null,
    bookedForPhone: body.bookedForPhone?.trim() || null,
    notes: body.notes?.trim() || null,
    checkoutContext: body.checkoutContext ?? {},
  };
}

export function placeholderCheckoutReference(bookingId: string): string {
  return `checkout_placeholder:${bookingId}`;
}

export function getCheckoutWarnings(
  idempotencyKeySource: "header" | "generated",
  envStatus: BookingCheckoutEnvStatus,
): string[] {
  const warnings = [
    "This scaffold persists provisional booking/payment rows but does not create Stripe objects yet.",
  ];

  if (idempotencyKeySource === "generated") {
    warnings.unshift(
      "No idempotency-key header was supplied. A generated key was used, so retries only dedupe if the caller reuses the returned key.",
    );
  }

  if (!envStatus.secretKeyConfigured) {
    warnings.push("STRIPE_SECRET_KEY is not configured, so the next implementation step cannot call Stripe yet.");
  }

  if (!envStatus.publishableKeyConfigured) {
    warnings.push("STRIPE_PUBLISHABLE_KEY is not configured, so the client cannot receive Stripe publishable configuration yet.");
  }

  return warnings;
}

export function getWebhookVerificationState(
  webhookSecretConfigured: boolean,
  stripeSignaturePresent: boolean,
): StripeWebhookResponse["verificationState"] {
  if (!webhookSecretConfigured) {
    return "secret_not_configured";
  }
  if (!stripeSignaturePresent) {
    return "missing_signature";
  }
  return "signature_present_not_verified";
}
