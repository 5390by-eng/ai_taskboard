import { CheckCircle2, XCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRefreshBilling } from "@/features/billing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import {
  buildBillingPostCheckoutSync,
  resolveCheckoutType,
  saveBillingPostCheckoutSync,
} from "@/lib/billing-sync";
import { queryKeys } from "@/lib/query-keys";
import type { Subscription, UsageStats } from "@/types";

export function BillingSuccessPage() {
  const [searchParams] = useSearchParams();
  const refreshBilling = useRefreshBilling();
  const queryClient = useQueryClient();
  const sessionId = searchParams.get("session_id");
  const checkoutType = resolveCheckoutType(searchParams.get("type"));

  useEffect(() => {
    const subscription = queryClient.getQueryData<Subscription>(queryKeys.billing.subscription);
    const usage = queryClient.getQueryData<UsageStats>(queryKeys.billing.usage());

    saveBillingPostCheckoutSync(
      buildBillingPostCheckoutSync({
        sessionId,
        checkoutType,
        subscription,
        usage,
      }),
    );

    void refreshBilling();
  }, [checkoutType, queryClient, refreshBilling, sessionId]);

  const successMessage =
    checkoutType === "ai_topup"
      ? "Your AI request credits are being added. It may take a few seconds for the balance to update."
      : "Your subscription is being activated. It may take a few seconds for your plan to update.";

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
            Payment successful
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{successMessage}</p>
          {sessionId && (
            <p className="text-xs text-muted-foreground break-all">Session: {sessionId}</p>
          )}
          <Button asChild className="w-full">
            <Link to={ROUTES.billing}>Back to Billing</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function BillingCancelPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-6 w-6" />
            Checkout canceled
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            No charges were made. You can return to billing and choose a plan anytime.
          </p>
          <Button asChild className="w-full">
            <Link to={ROUTES.billing}>Back to Billing</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
