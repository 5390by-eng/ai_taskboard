import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingService } from "@/services";
import { queryKeys } from "@/lib/query-keys";
import type { PaymentPlanId } from "@/types";
import { toast } from "sonner";

export function useSubscription() {
  return useQuery({
    queryKey: queryKeys.billing.subscription,
    queryFn: async () => {
      const result = await billingService.getSubscription();
      if (result.error) throw new Error(result.error);
      return result.data;
    },
  });
}

export function useUsage() {
  return useQuery({
    queryKey: queryKeys.billing.usage(),
    queryFn: async () => {
      const result = await billingService.getUsage();
      if (result.error) throw new Error(result.error);
      return result.data;
    },
  });
}

export function usePlans() {
  return useQuery({
    queryKey: queryKeys.billing.plans,
    queryFn: async () => {
      const result = await billingService.getPlans();
      if (result.error) throw new Error(result.error);
      return result.data;
    },
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: async (planId: PaymentPlanId) => {
      const result = await billingService.createCheckoutSession(planId);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      if (!data?.url) return;
      window.location.assign(data.url);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useBillingPortal() {
  return useMutation({
    mutationFn: async () => {
      const result = await billingService.createPortalSession();
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      if (!data?.url) return;
      window.location.assign(data.url);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useCreateAiTopupCheckout() {
  return useMutation({
    mutationFn: async (amountUsd: number) => {
      const result = await billingService.createAiTopupCheckoutSession(amountUsd);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      if (!data?.url) return;
      window.location.assign(data.url);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRefreshBilling() {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.subscription }),
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.usage() }),
      queryClient.refetchQueries({ queryKey: queryKeys.billing.subscription }),
      queryClient.refetchQueries({ queryKey: queryKeys.billing.usage() }),
    ]);
  };
}

/** @deprecated Use useCreateCheckout instead */
export function useUpgradePlan() {
  return useCreateCheckout();
}
