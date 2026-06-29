import type { PaymentPlan, Subscription, UsageStats, PaymentPlanId } from "@/types";

export const mockPlans: PaymentPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "month",
    features: [
      "3 boards",
      "50 tasks",
      "No AI requests",
      "3 team members",
    ],
    limits: {
      boards: 3,
      tasks: 50,
      aiRequests: 0,
      teamMembers: 3,
    },
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    interval: "month",
    features: [
      "Unlimited boards",
      "500 tasks",
      "100 AI requests",
      "5 team members",
    ],
    limits: {
      boards: 999,
      tasks: 500,
      aiRequests: 100,
      teamMembers: 5,
    },
  },
  {
    id: "team",
    name: "Team",
    price: 49,
    interval: "month",
    features: [
      "Unlimited boards",
      "Unlimited tasks",
      "500 AI requests",
      "Unlimited team members",
      "Telegram notifications",
      "Create tasks from Telegram",     
    ],
    limits: {
      boards: 999,
      tasks: 9999,
      aiRequests: 500,
      teamMembers: 999,
    },
  },
];

export const mockSubscription: Subscription = {
  planId: "free",
  status: "active",
  currentPeriodEnd: "2025-07-01T00:00:00.000Z",
  cancelAtPeriodEnd: false,
};

export const mockUsageByPlan: Record<PaymentPlanId, UsageStats> = {
  free: {
    boardsUsed: 2,
    tasksUsed: 15,
    aiRequestsUsed: 0,
    teamMembersUsed: 3,
    aiRequestsPlanLimit: 0,
    aiCreditsBalance: 0,
    aiRequestsEffectiveLimit: 0,
    aiRequestsRemaining: 0,
  },
  pro: {
    boardsUsed: 4,
    tasksUsed: 120,
    aiRequestsUsed: 35,
    teamMembersUsed: 4,
    aiRequestsPlanLimit: 100,
    aiCreditsBalance: 10,
    aiRequestsEffectiveLimit: 110,
    aiRequestsRemaining: 75,
  },
  team: {
    boardsUsed: 8,
    tasksUsed: 1200,
    aiRequestsUsed: 180,
    teamMembersUsed: 12,
    aiRequestsPlanLimit: 500,
    aiCreditsBalance: 0,
    aiRequestsEffectiveLimit: 500,
    aiRequestsRemaining: 320,
  },
};

export const mockUsage: UsageStats = mockUsageByPlan.free;
