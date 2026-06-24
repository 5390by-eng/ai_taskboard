export type AssigneeLookup = {
  id: string;
  name: string;
  avatarUrl?: string;
};

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

export function getNameInitials(name: string): string {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return initials || "?";
}
