export type PaymentPlanId = "free" | "pro" | "team";

export type PaymentPlan = {
  id: PaymentPlanId;
  name: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  limits: {
    boards: number;
    tasks: number;
    aiRequests: number;
    teamMembers: number;
  };
};

export type Subscription = {
  planId: PaymentPlanId;
  status: "active" | "trialing" | "canceled" | "past_due";
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
};

export type UsageStats = {
  boardsUsed: number;
  tasksUsed: number;
  aiRequestsUsed: number;
  teamMembersUsed: number;
};
