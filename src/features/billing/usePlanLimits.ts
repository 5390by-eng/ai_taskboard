import { useMemo } from "react";
import { resolveAiUsageDisplay } from "@/lib/ai-usage-display";
import type { PaymentPlan, PaymentPlanId, UsageStats } from "@/types";
import { usePlans, useSubscription, useUsage } from "./useBilling";

const DEFAULT_LIMITS: PaymentPlan["limits"] = {
  boards: 3,
  tasks: 50,
  aiRequests: 0,
  teamMembers: 3,
};

function isUnlimitedLimit(limit: number): boolean {
  return limit >= 999;
}

export type PlanLimitsState = {
  isLoading: boolean;
  planId: PaymentPlanId;
  planName: string;
  limits: PaymentPlan["limits"];
  usage: UsageStats | null;
  boardsUsed: number;
  tasksUsed: number;
  teamMembersUsed: number;
  aiRemaining: number;
  canCreateBoard: boolean;
  canCreateTask: boolean;
  canAddTeamMember: boolean;
  canUseAi: boolean;
  boardsRemaining: number;
  tasksRemaining: number;
  teamMembersRemaining: number;
  boardLimitMessage: string | null;
  taskLimitMessage: string | null;
  teamMemberLimitMessage: string | null;
  canSelectMoreMembers: (selectedCount: number) => boolean;
  canCreateTasksCount: (count: number) => boolean;
};

export function usePlanLimits(): PlanLimitsState {
  const subscriptionQuery = useSubscription();
  const usageQuery = useUsage();
  const plansQuery = usePlans();

  const planId = subscriptionQuery.data?.planId ?? "free";
  const usage = usageQuery.data;
  const currentPlan = plansQuery.data?.find((plan) => plan.id === planId);
  const limits = currentPlan?.limits ?? DEFAULT_LIMITS;
  const planName = currentPlan?.name ?? "Free";

  return useMemo(() => {
    const boardsUsed = usage?.boardsUsed ?? 0;
    const tasksUsed = usage?.tasksUsed ?? 0;
    const teamMembersUsed = usage?.teamMembersUsed ?? 0;
    const aiUsage = usage ? resolveAiUsageDisplay(usage, limits.aiRequests) : null;
    const aiRemaining = aiUsage?.remaining ?? 0;

    const unlimitedBoards = isUnlimitedLimit(limits.boards);
    const unlimitedTasks = isUnlimitedLimit(limits.tasks);
    const unlimitedMembers = isUnlimitedLimit(limits.teamMembers);

    const boardsRemaining = unlimitedBoards
      ? Number.MAX_SAFE_INTEGER
      : Math.max(limits.boards - boardsUsed, 0);
    const tasksRemaining = unlimitedTasks
      ? Number.MAX_SAFE_INTEGER
      : Math.max(limits.tasks - tasksUsed, 0);
    const teamMembersRemaining = unlimitedMembers
      ? Number.MAX_SAFE_INTEGER
      : Math.max(limits.teamMembers - teamMembersUsed, 0);

    const canCreateBoard = unlimitedBoards || boardsUsed < limits.boards;
    const canCreateTask = unlimitedTasks || tasksUsed < limits.tasks;
    const canAddTeamMember = unlimitedMembers || teamMembersUsed < limits.teamMembers;
    const canUseAi = aiRemaining > 0;

    const upgradeHint = "Upgrade your plan on the Billing page to increase limits.";

    return {
      isLoading:
        subscriptionQuery.isLoading || usageQuery.isLoading || plansQuery.isLoading,
      planId,
      planName,
      limits,
      usage: usage ?? null,
      boardsUsed,
      tasksUsed,
      teamMembersUsed,
      aiRemaining,
      canCreateBoard,
      canCreateTask,
      canAddTeamMember,
      canUseAi,
      boardsRemaining,
      tasksRemaining,
      teamMembersRemaining,
      boardLimitMessage: canCreateBoard
        ? null
        : `You have reached the ${limits.boards}-board limit on the ${planName} plan. ${upgradeHint}`,
      taskLimitMessage: canCreateTask
        ? null
        : `You have reached the ${limits.tasks}-task limit on the ${planName} plan. ${upgradeHint}`,
      teamMemberLimitMessage: canAddTeamMember
        ? null
        : `You have reached the ${limits.teamMembers} team member limit on the ${planName} plan. ${upgradeHint}`,
      canSelectMoreMembers: (selectedCount: number) =>
        unlimitedMembers || teamMembersUsed + selectedCount <= limits.teamMembers,
      canCreateTasksCount: (count: number) =>
        unlimitedTasks || tasksUsed + count <= limits.tasks,
    };
  }, [
    usage,
    limits,
    planId,
    planName,
    subscriptionQuery.isLoading,
    usageQuery.isLoading,
    plansQuery.isLoading,
  ]);
}
