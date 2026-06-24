import type { PaymentPlan, Subscription, UsageStats } from "@/types";

export const mockPlans: PaymentPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "month",
    features: [
      "Up to 3 boards",
      "100 tasks",
      "10 AI requests/month",
      "1 team member",
    ],
    limits: {
      boards: 3,
      tasks: 100,
      aiRequests: 10,
      teamMembers: 1,
    },
  },
  {
    id: "pro",
    name: "Pro",
    price: 12,
    interval: "month",
    features: [
      "Unlimited boards",
      "Unlimited tasks",
      "500 AI requests/month",
      "Up to 5 team members",
      "Telegram integration",
    ],
    limits: {
      boards: 999,
      tasks: 9999,
      aiRequests: 500,
      teamMembers: 5,
    },
  },
  {
    id: "team",
    name: "Team",
    price: 29,
    interval: "month",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Priority support",
      "Advanced analytics",
      "Custom integrations",
    ],
    limits: {
      boards: 999,
      tasks: 9999,
      aiRequests: 2000,
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

export const mockUsage: UsageStats = {
  boardsUsed: 2,
  tasksUsed: 15,
  aiRequestsUsed: 3,
  teamMembersUsed: 3,
};
