import type { Task } from "@/types";

export type AssigneeLookup = {
  id: string;
  name: string;
  avatarUrl?: string;
};

type TaskWithAssignees = Pick<Task, "assigneeId" | "assigneeIds">;

function normalizeAssigneeId(id: string): string {
  return id.trim().toLowerCase();
}

export function buildMembersById(
  members: AssigneeLookup[],
): Map<string, AssigneeLookup> {
  return new Map(members.map((member) => [normalizeAssigneeId(member.id), member]));
}

export function findAssignee(
  assigneeId: string | undefined,
  members: AssigneeLookup[],
): AssigneeLookup | undefined {
  if (!assigneeId) {
    return undefined;
  }

  const normalizedId = normalizeAssigneeId(assigneeId);
  return members.find((member) => normalizeAssigneeId(member.id) === normalizedId);
}

export function getAssigneeDisplayName(
  assigneeId: string | undefined,
  members: AssigneeLookup[],
): string {
  if (!assigneeId) {
    return "Unassigned";
  }

  return findAssignee(assigneeId, members)?.name ?? "Unknown member";
}

export function normalizeTaskAssignees(task: TaskWithAssignees): string[] {
  if (task.assigneeIds && task.assigneeIds.length > 0) {
    return [...new Set(task.assigneeIds)];
  }

  if (task.assigneeId) {
    return [task.assigneeId];
  }

  return [];
}

export function findAssignees(
  assigneeIds: string[],
  members: AssigneeLookup[],
): AssigneeLookup[] {
  return assigneeIds.flatMap((assigneeId) => {
    const assignee = findAssignee(assigneeId, members);
    return assignee ? [assignee] : [];
  });
}

export function withNormalizedAssignees<T extends TaskWithAssignees>(task: T): T {
  const assigneeIds = normalizeTaskAssignees(task);
  return {
    ...task,
    assigneeIds,
    assigneeId: assigneeIds[0],
  };
}

export function getNameInitials(name: string): string {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return initials || "?";
}
