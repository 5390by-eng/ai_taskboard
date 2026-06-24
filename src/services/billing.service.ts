import type {
  PaymentPlan,
  PaymentPlanId,
  ServiceResult,
  Subscription,
  UsageStats,
} from "@/types";
import { mockPlans, mockSubscription, mockUsage } from "@/lib/mock-data/billing";
import { delay } from "@/lib/utils";
import { success } from "@/types/api";

let subscription = { ...mockSubscription };

async function simulateDelay(): Promise<void> {
  await delay(300 + Math.random() * 500);
}

export const billingService = {
  async getSubscription(): Promise<ServiceResult<Subscription>> {
    await simulateDelay();
    return success({ ...subscription });
  },

  async getUsage(): Promise<ServiceResult<UsageStats>> {
    await simulateDelay();
    return success({ ...mockUsage });
  },

  async getPlans(): Promise<ServiceResult<PaymentPlan[]>> {
    await simulateDelay();
    return success([...mockPlans]);
  },

  async upgradePlan(planId: PaymentPlanId): Promise<ServiceResult<Subscription>> {
    await simulateDelay();
    subscription = {
      ...subscription,
      planId,
      status: "active",
    };
    return success({ ...subscription });
  },
};
