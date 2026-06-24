export type AssigneeLookup = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export function findAssignee(
  assigneeId: string | undefined,
  members: AssigneeLookup[],
): AssigneeLookup | undefined {
  if (!assigneeId) {
    return undefined;
  }

  return members.find((member) => member.id === assigneeId);
}

export function getNameInitials(name: string): string {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return initials || "?";
}
