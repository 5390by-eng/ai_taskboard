import { BILLING_POST_CHECKOUT_SYNC_KEY } from "@/lib/constants";
import type { PaymentPlanId, Subscription, UsageStats } from "@/types";

export type BillingCheckoutType = "plan" | "ai_topup";

export type BillingPostCheckoutSync = {
  at: number;
  sessionId: string | null;
  checkoutType: BillingCheckoutType;
  previousPlanId: PaymentPlanId;
  previousAiCreditsBalance: number;
  previousAiRequestsRemaining: number;
};

export function resolveCheckoutType(value: string | null): BillingCheckoutType {
  return value === "ai_topup" ? "ai_topup" : "plan";
}

export function parseBillingPostCheckoutSync(raw: string | null): BillingPostCheckoutSync | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    const record = parsed as Record<string, unknown>;
    if (typeof record.at !== "number") {
      return null;
    }

    const previousPlanId = record.previousPlanId;
    const checkoutType = record.checkoutType;

    return {
      at: record.at,
      sessionId: typeof record.sessionId === "string" ? record.sessionId : null,
      checkoutType: checkoutType === "ai_topup" ? "ai_topup" : "plan",
      previousPlanId:
        previousPlanId === "pro" || previousPlanId === "team" || previousPlanId === "free"
          ? previousPlanId
          : "free",
      previousAiCreditsBalance:
        typeof record.previousAiCreditsBalance === "number" ? record.previousAiCreditsBalance : 0,
      previousAiRequestsRemaining:
        typeof record.previousAiRequestsRemaining === "number"
          ? record.previousAiRequestsRemaining
          : 0,
    };
  } catch {
    return null;
  }
}

export function buildBillingPostCheckoutSync(input: {
  sessionId: string | null;
  checkoutType: BillingCheckoutType;
  subscription: Subscription | undefined;
  usage: UsageStats | undefined;
}): BillingPostCheckoutSync {
  return {
    at: Date.now(),
    sessionId: input.sessionId,
    checkoutType: input.checkoutType,
    previousPlanId: input.subscription?.planId ?? "free",
    previousAiCreditsBalance: input.usage?.aiCreditsBalance ?? 0,
    previousAiRequestsRemaining: input.usage?.aiRequestsRemaining ?? 0,
  };
}

export function saveBillingPostCheckoutSync(payload: BillingPostCheckoutSync): void {
  window.sessionStorage.setItem(BILLING_POST_CHECKOUT_SYNC_KEY, JSON.stringify(payload));
}

export function clearBillingPostCheckoutSync(): void {
  window.sessionStorage.removeItem(BILLING_POST_CHECKOUT_SYNC_KEY);
}

export function isBillingSyncComplete(
  sync: BillingPostCheckoutSync,
  subscription: Subscription | null | undefined,
  usage: UsageStats | null | undefined,
): boolean {
  if (sync.checkoutType === "ai_topup") {
    const creditsBalance = usage?.aiCreditsBalance ?? 0;
    const requestsRemaining = usage?.aiRequestsRemaining ?? 0;

    return (
      creditsBalance > sync.previousAiCreditsBalance ||
      requestsRemaining > sync.previousAiRequestsRemaining
    );
  }

  const currentPlanId = subscription?.planId ?? "free";
  return currentPlanId !== sync.previousPlanId;
}
