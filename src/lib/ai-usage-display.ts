import type { UsageStats } from "@/types";

export type AiUsageDisplay = {
  effectiveLimit: number;
  remaining: number;
};

/** Plan AI limit + purchased credits (matches billing_get_usage total pool). */
export function resolveAiUsageDisplay(
  usage: UsageStats,
  planAiLimit: number,
): AiUsageDisplay {
  const planLimit = usage.aiRequestsPlanLimit > 0 ? usage.aiRequestsPlanLimit : planAiLimit;
  const purchasedPool = planLimit + usage.aiCreditsBalance;
  const effectiveLimit = Math.max(
    usage.aiRequestsEffectiveLimit,
    usage.aiRequestsRemaining + usage.aiRequestsUsed,
    purchasedPool,
  );
  const remaining = Math.max(usage.aiRequestsRemaining, effectiveLimit - usage.aiRequestsUsed);

  return { effectiveLimit, remaining };
}
