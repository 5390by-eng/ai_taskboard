import { CreditCard } from "lucide-react";
import { useSubscription, useUsage, usePlans, useUpgradePlan } from "@/features/billing";
import { PlanCard, UsageMeter } from "@/components/billing";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PaymentPlanId } from "@/types";

export function BillingPage() {
  const { data: subscription, isLoading: subLoading, isError: subError, refetch: refetchSub } = useSubscription();
  const { data: usage, isLoading: usageLoading, isError: usageError, refetch: refetchUsage } = useUsage();
  const { data: plans, isLoading: plansLoading, isError: plansError, refetch: refetchPlans } = usePlans();
  const upgradePlan = useUpgradePlan();

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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{currentPlan?.name ?? "Free"}</p>
          <p className="text-sm text-muted-foreground">
            Renews on {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : "—"}
          </p>
        </CardContent>
      </Card>

      {usage && currentPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <UsageMeter label="Boards" used={usage.boardsUsed} limit={currentPlan.limits.boards} />
            <UsageMeter label="Tasks" used={usage.tasksUsed} limit={currentPlan.limits.tasks} />
            <UsageMeter label="AI Requests" used={usage.aiRequestsUsed} limit={currentPlan.limits.aiRequests} />
            <UsageMeter label="Team Members" used={usage.teamMembersUsed} limit={currentPlan.limits.teamMembers} />
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
                plan.id !== subscription?.planId
                  ? () => upgradePlan.mutate(plan.id as PaymentPlanId)
                  : undefined
              }
              isUpgrading={upgradePlan.isPending}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
