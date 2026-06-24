import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Profile } from "@/features/auth/profile.service";

type BoardMembersProps = {
  members: Profile[];
  isLoading?: boolean;
  isError?: boolean;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function BoardMembers({ members, isLoading, isError }: BoardMembersProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading members...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 px-4 py-3 text-sm text-destructive">
        Failed to load board members
      </div>
    );
  }

  if (members.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border p-4">
      <h2 className="mb-3 text-sm font-medium">Members ({members.length})</h2>
      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-3 py-1">
            <Avatar className="h-8 w-8">
              {member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt={member.name} /> : null}
              <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{member.name}</p>
              <p className="truncate text-xs text-muted-foreground">{member.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
