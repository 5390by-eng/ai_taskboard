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
    queryKey: queryKeys.billing.usage,
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

export function useUpgradePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: PaymentPlanId) => {
      const result = await billingService.upgradePlan(planId);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.subscription });
      toast.success("Plan upgraded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
