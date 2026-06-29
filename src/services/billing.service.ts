import { z } from "zod";
import { env } from "@/lib/env";
import { getSupabaseClient } from "@/lib/supabase";
import type {
  PaymentPlan,
  PaymentPlanId,
  ServiceResult,
  Subscription,
  UsageStats,
} from "@/types";
import { failure, success } from "@/types/api";

const subscriptionSchema = z.object({
  planId: z.enum(["free", "pro", "team"]),
  status: z.enum(["active", "trialing", "canceled", "past_due"]),
  currentPeriodEnd: z.string(),
  cancelAtPeriodEnd: z.boolean(),
});

const usageSchema = z.object({
  boardsUsed: z.number(),
  tasksUsed: z.number(),
  aiRequestsUsed: z.number(),
  teamMembersUsed: z.number(),
  aiRequestsPlanLimit: z.number().optional().default(0),
  aiCreditsBalance: z.number().optional().default(0),
  aiRequestsEffectiveLimit: z.number().optional().default(0),
  aiRequestsRemaining: z.number().optional().default(0),
});

const planSchema = z.object({
  id: z.enum(["free", "pro", "team"]),
  name: z.string(),
  price: z.number(),
  interval: z.enum(["month", "year"]),
  features: z.array(z.string()),
  limits: z.object({
    boards: z.number(),
    tasks: z.number(),
    aiRequests: z.number(),
    teamMembers: z.number(),
  }),
});

const checkoutSessionSchema = z.object({
  url: z.string().url(),
});

const aiTopupCheckoutSchema = z.object({
  url: z.string().url(),
  estimatedCredits: z.number(),
  amountCents: z.number(),
});

const portalSessionSchema = z.object({
  url: z.string().url(),
});

const errorSchema = z.object({
  error: z.string(),
});

const supabaseSubscriptionSchema = z.object({
  plan_id: z.enum(["free", "pro", "team"]),
  status: z.enum(["active", "trialing", "canceled", "past_due"]),
  current_period_end: z.string().nullable(),
  cancel_at_period_end: z.boolean(),
});

const supabasePaymentSchema = z.object({
  plan_id: z.enum(["free", "pro", "team"]).nullable(),
  status: z.string(),
  created_at: z.string(),
});

const paidPaymentStatuses = new Set(["paid", "succeeded", "success", "completed"]);

function mapSupabaseSubscription(
  row: z.infer<typeof supabaseSubscriptionSchema>,
): Subscription {
  return {
    planId: row.plan_id,
    status: row.status,
    currentPeriodEnd: row.current_period_end ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: row.cancel_at_period_end,
  };
}

async function getSubscriptionFromSupabase(): Promise<Subscription | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("billing_subscriptions")
    .select("plan_id,status,current_period_end,cancel_at_period_end")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const parsed = supabaseSubscriptionSchema.safeParse(data);
  if (!parsed.success) {
    return null;
  }

  return mapSupabaseSubscription(parsed.data);
}

async function getPaidPlanFallbackFromSupabase(): Promise<Subscription | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("billing_payments")
    .select("plan_id,status,created_at")
    .in("plan_id", ["pro", "team"])
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return null;
  }

  const parsed = supabasePaymentSchema.safeParse(data[0]);
  if (!parsed.success || !parsed.data.plan_id) {
    return null;
  }

  const normalizedStatus = parsed.data.status.toLowerCase();
  if (!paidPaymentStatuses.has(normalizedStatus)) {
    return null;
  }

  return {
    planId: parsed.data.plan_id,
    status: "active",
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: false,
  };
}

async function resolveSubscriptionWithFallbacks(subscription: Subscription): Promise<Subscription> {
  if (subscription.planId !== "free") {
    return subscription;
  }

  const supabaseSubscription = await getSubscriptionFromSupabase();
  if (supabaseSubscription && supabaseSubscription.planId !== "free") {
    return supabaseSubscription;
  }

  const paidPlanFallback = await getPaidPlanFallbackFromSupabase();
  if (paidPlanFallback) {
    return paidPlanFallback;
  }

  return subscription;
}

function buildBillingApiUrl(path: string): string {
  const base = env.apiBaseUrl.replace(/\/$/, "");
  return base ? `${base}${path}` : path;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }

  const accessToken = data.session?.access_token;
  if (!accessToken) {
    throw new Error("You must be signed in to manage billing");
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const json: unknown = await response.json();
    const parsed = errorSchema.safeParse(json);
    if (parsed.success) {
      return parsed.data.error;
    }
  } catch {
    // fall through
  }

  return `Billing request failed with status ${response.status}`;
}

async function billingFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<ServiceResult<T>> {
  try {
    const method = (options.method ?? "GET").toUpperCase();
    const isGetRequest = method === "GET";
    const headers = options.auth
      ? { ...(await getAuthHeaders()), ...(options.headers ?? {}) }
      : {
          "Content-Type": "application/json",
          ...(options.headers ?? {}),
        };

    const requestHeaders = isGetRequest
      ? {
          ...headers,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        }
      : headers;

    const response = await fetch(buildBillingApiUrl(path), {
      ...options,
      method,
      headers: requestHeaders,
      cache: isGetRequest ? "no-store" : options.cache,
    });

    if (!response.ok) {
      return failure(await parseErrorMessage(response));
    }

    const json: unknown = await response.json();
    return success(json as T);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Billing request failed";
    if (message === "Failed to fetch") {
      return failure("Cannot reach billing service. Check your network or API configuration.");
    }
    return failure(message);
  }
}

export const billingService = {
  async getSubscription(): Promise<ServiceResult<Subscription>> {
    const result = await billingFetch<unknown>("/api/billing/subscription", {
      method: "GET",
      auth: true,
    });

    if (result.error) {
      return result;
    }

    const parsed = subscriptionSchema.safeParse(result.data);
    if (!parsed.success) {
      return failure("Invalid subscription response from billing service");
    }

    const subscription = await resolveSubscriptionWithFallbacks(parsed.data);
    return success(subscription);
  },

  async getUsage(): Promise<ServiceResult<UsageStats>> {
    const result = await billingFetch<unknown>("/api/billing/usage", {
      method: "GET",
      auth: true,
    });

    if (result.error) {
      return result;
    }

    const parsed = usageSchema.safeParse(result.data);
    if (!parsed.success) {
      return failure("Invalid usage response from billing service");
    }

    const usage = parsed.data;
    const planLimit = usage.aiRequestsPlanLimit ?? 0;
    const creditsBalance = usage.aiCreditsBalance ?? 0;
    const requestsRemaining = usage.aiRequestsRemaining ?? 0;
    const purchasedPool = planLimit + creditsBalance;
    const effectiveLimit = Math.max(
      usage.aiRequestsEffectiveLimit ?? 0,
      requestsRemaining + usage.aiRequestsUsed,
      purchasedPool,
    );
    const remaining = Math.max(requestsRemaining, effectiveLimit - usage.aiRequestsUsed);

    return success({
      ...usage,
      aiRequestsPlanLimit: planLimit,
      aiCreditsBalance: creditsBalance,
      aiRequestsEffectiveLimit: effectiveLimit,
      aiRequestsRemaining: remaining,
    });
  },

  async getPlans(): Promise<ServiceResult<PaymentPlan[]>> {
    const result = await billingFetch<unknown>("/api/billing/plans", {
      method: "GET",
    });

    if (result.error) {
      return result;
    }

    const parsed = z.array(planSchema).safeParse(result.data);
    if (!parsed.success) {
      return failure("Invalid plans response from billing service");
    }

    return success(parsed.data);
  },

  async createCheckoutSession(planId: PaymentPlanId): Promise<ServiceResult<{ url: string }>> {
    const result = await billingFetch<unknown>("/api/billing/checkout-session", {
      method: "POST",
      auth: true,
      body: JSON.stringify({
        planId,
        successUrl: `${window.location.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/billing/cancel`,
      }),
    });

    if (result.error) {
      return result;
    }

    const parsed = checkoutSessionSchema.safeParse(result.data);
    if (!parsed.success) {
      return failure("Invalid checkout session response from billing service");
    }

    return success(parsed.data);
  },

  async createPortalSession(): Promise<ServiceResult<{ url: string }>> {
    const result = await billingFetch<unknown>("/api/billing/portal", {
      method: "POST",
      auth: true,
      body: JSON.stringify({
        returnUrl: `${window.location.origin}/billing`,
      }),
    });

    if (result.error) {
      return result;
    }

    const parsed = portalSessionSchema.safeParse(result.data);
    if (!parsed.success) {
      return failure("Invalid portal session response from billing service");
    }

    return success(parsed.data);
  },

  async createAiTopupCheckoutSession(
    amountUsd: number,
  ): Promise<ServiceResult<{ url: string; estimatedCredits: number }>> {
    const result = await billingFetch<unknown>("/api/billing/ai-topup-checkout-session", {
      method: "POST",
      auth: true,
      body: JSON.stringify({
        amountUsd,
        successUrl: `${window.location.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}&type=ai_topup`,
        cancelUrl: `${window.location.origin}/billing/cancel`,
      }),
    });

    if (result.error) {
      return result;
    }

    const parsed = aiTopupCheckoutSchema.safeParse(result.data);
    if (!parsed.success) {
      return failure("Invalid AI top-up checkout response from billing service");
    }

    return success({
      url: parsed.data.url,
      estimatedCredits: parsed.data.estimatedCredits,
    });
  },
};
