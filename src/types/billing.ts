export type PaymentPlanId = "free" | "pro" | "team";

export type PaymentPlan = {
  id: PaymentPlanId;
  name: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  limits: {
    boards: number;
    tasks: number;
    aiRequests: number;
    teamMembers: number;
  };
};

export type Subscription = {
  planId: PaymentPlanId;
  status: "active" | "trialing" | "canceled" | "past_due";
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
};

export type UsageStats = {
  boardsUsed: number;
  tasksUsed: number;
  aiRequestsUsed: number;
  teamMembersUsed: number;
  aiRequestsPlanLimit: number;
  aiCreditsBalance: number;
  aiRequestsEffectiveLimit: number;
  aiRequestsRemaining: number;
};

export const AI_REQUEST_PRICE_USD = 0.5;

export function calculateAiCreditsFromAmountUsd(amountUsd: number): number {
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
    return 0;
  }
  return Math.floor(amountUsd / AI_REQUEST_PRICE_USD);
}
