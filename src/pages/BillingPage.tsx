import { CreditCard, ExternalLink, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useSubscription,
  useUsage,
  usePlans,
  useCreateCheckout,
  useCreateAiTopupCheckout,
  useBillingPortal,
} from "@/features/billing";
import { AiTopupDialog, PlanCard, UsageMeter } from "@/components/billing";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BILLING_POST_CHECKOUT_SYNC_KEY,
  BILLING_POST_CHECKOUT_SYNC_WINDOW_MS,
} from "@/lib/constants";
import {
  clearBillingPostCheckoutSync,
  isBillingSyncComplete,
  parseBillingPostCheckoutSync,
} from "@/lib/billing-sync";
import { resolveAiUsageDisplay } from "@/lib/ai-usage-display";
import type { PaymentPlanId } from "@/types";

const POST_CHECKOUT_POLL_INTERVAL_MS = 3000;
const POST_CHECKOUT_MAX_ATTEMPTS = 10;

export function BillingPage() {
  const { data: subscription, isLoading: subLoading, isError: subError, refetch: refetchSub } =
    useSubscription();
  const { data: usage, isLoading: usageLoading, isError: usageError, refetch: refetchUsage } =
    useUsage();
  const { data: plans, isLoading: plansLoading, isError: plansError, refetch: refetchPlans } =
    usePlans();
  const createCheckout = useCreateCheckout();
  const createAiTopup = useCreateAiTopupCheckout();
  const billingPortal = useBillingPortal();
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const syncCompletedRef = useRef(false);

  useEffect(() => {
    if (syncCompletedRef.current) {
      return;
    }

    const sync = parseBillingPostCheckoutSync(
      window.sessionStorage.getItem(BILLING_POST_CHECKOUT_SYNC_KEY),
    );

    if (!sync) {
      return;
    }

    if (Date.now() - sync.at > BILLING_POST_CHECKOUT_SYNC_WINDOW_MS) {
      clearBillingPostCheckoutSync();
      return;
    }

    if (isBillingSyncComplete(sync, subscription, usage)) {
      syncCompletedRef.current = true;
      clearBillingPostCheckoutSync();

      if (sync.checkoutType === "ai_topup") {
        toast.success("AI request credits updated");
      } else {
        toast.success("Subscription plan updated");
      }
      return;
    }

    let attempts = 0;

    const refetchBilling = (): void => {
      void Promise.all([refetchSub(), refetchUsage(), refetchPlans()]);
      attempts += 1;
    };

    refetchBilling();

    const intervalId = window.setInterval(() => {
      const latestSync = parseBillingPostCheckoutSync(
        window.sessionStorage.getItem(BILLING_POST_CHECKOUT_SYNC_KEY),
      );

      if (!latestSync || Date.now() - latestSync.at > BILLING_POST_CHECKOUT_SYNC_WINDOW_MS) {
        clearBillingPostCheckoutSync();
        window.clearInterval(intervalId);
        return;
      }

      if (isBillingSyncComplete(latestSync, subscription, usage)) {
        syncCompletedRef.current = true;
        clearBillingPostCheckoutSync();
        window.clearInterval(intervalId);

        if (latestSync.checkoutType === "ai_topup") {
          toast.success("AI request credits updated");
        } else {
          toast.success("Subscription plan updated");
        }
        return;
      }

      if (attempts >= POST_CHECKOUT_MAX_ATTEMPTS) {
        clearBillingPostCheckoutSync();
        window.clearInterval(intervalId);
        return;
      }

      refetchBilling();
    }, POST_CHECKOUT_POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    subscription,
    subscription?.planId,
    usage,
    usage?.aiCreditsBalance,
    usage?.aiRequestsRemaining,
    refetchPlans,
    refetchSub,
    refetchUsage,
  ]);

  const isLoading = subLoading || usageLoading || plansLoading;
  const isError = subError || usageError || plansError;

  if (isLoading) return <LoadingState message="Loading billing..." />;
  if (isError) {
    return (
      <ErrorState
        onRetry={() => {
          refetchSub();
          refetchUsage();
          refetchPlans();
        }}
      />
    );
  }

  const currentPlan = plans?.find((p) => p.id === subscription?.planId);
  const hasPaidPlan = subscription?.planId !== "free";
  const aiUsage =
    usage && currentPlan
      ? resolveAiUsageDisplay(usage, currentPlan.limits.aiRequests)
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          Billing
        </h1>
        <p className="text-muted-foreground">Manage your subscription and usage</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Current Plan
            <Badge variant="secondary">{subscription?.status}</Badge>
            {subscription?.cancelAtPeriodEnd && (
              <Badge variant="outline">Cancels at period end</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-2xl font-bold">{currentPlan?.name ?? "Free"}</p>
            <p className="text-sm text-muted-foreground">
              Renews on{" "}
              {subscription?.currentPeriodEnd
                ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                : "—"}
            </p>
          </div>
          {hasPaidPlan && (
            <Button
              variant="outline"
              onClick={() => billingPortal.mutate()}
              disabled={billingPortal.isPending}
            >
              <ExternalLink className="h-4 w-4" />
              {billingPortal.isPending ? "Opening portal..." : "Manage billing"}
            </Button>
          )}
        </CardContent>
      </Card>

      {usage && currentPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <p className="text-sm text-muted-foreground">
              Limits for {currentPlan.name} plan
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <UsageMeter label="Boards" used={usage.boardsUsed} limit={currentPlan.limits.boards} />
            <UsageMeter label="Tasks" used={usage.tasksUsed} limit={currentPlan.limits.tasks} />
            <div className="space-y-2">
              <UsageMeter
                label="AI Requests"
                used={usage.aiRequestsUsed}
                limit={aiUsage?.effectiveLimit ?? currentPlan.limits.aiRequests}
              />
              <p className="text-xs text-muted-foreground">
                {aiUsage?.remaining ?? usage.aiRequestsRemaining} request
                {(aiUsage?.remaining ?? usage.aiRequestsRemaining) === 1 ? "" : "s"} remaining
              </p>
              {usage.aiCreditsBalance > 0 && (
                <p className="text-xs text-muted-foreground">
                  Purchased credits remaining: {usage.aiCreditsBalance}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTopupOpen(true)}
                disabled={createAiTopup.isPending}
              >
                <Plus className="h-4 w-4" />
                {createAiTopup.isPending ? "Redirecting..." : "Buy AI requests"}
              </Button>
            </div>
            <UsageMeter
              label="Team Members"
              used={usage.teamMembersUsed}
              limit={currentPlan.limits.teamMembers}
            />
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans?.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={plan.id === subscription?.planId}
              onUpgrade={
                plan.id !== subscription?.planId && plan.id !== "free"
                  ? () => createCheckout.mutate(plan.id as PaymentPlanId)
                  : undefined
              }
              isUpgrading={createCheckout.isPending}
            />
          ))}
        </div>
      </div>

      <AiTopupDialog
        open={isTopupOpen}
        onOpenChange={setIsTopupOpen}
        onSubmit={(amountUsd) => createAiTopup.mutate(amountUsd)}
        isLoading={createAiTopup.isPending}
      />
    </div>
  );
}
